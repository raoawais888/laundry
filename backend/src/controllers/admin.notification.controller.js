const Notification = require("../models/Notification");
const User = require("../models/User");
const Rider = require("../models/Rider");
const Admin = require("../models/Admin");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { sendPushToTokens } = require("../services/firebase.service");

// Firebase's sendEachForMulticast caps out at 500 tokens per call.
const FCM_BATCH_SIZE = 500;
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// Notification.type values sensible for an admin-composed broadcast — the
// order-lifecycle/payment types are set by the system itself, not an admin.
const BROADCAST_TYPES = ["promotion", "system", "review_reminder"];

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Notification.recipient is a polymorphic ref (User/Rider/Admin) — batch-fetch
// each group and attach a display name rather than doing per-row lookups.
const attachRecipientNames = async (notifications) => {
  const idsByModel = { User: [], Rider: [], Admin: [] };
  for (const n of notifications) idsByModel[n.recipientModel]?.push(n.recipient);

  const [users, riders, admins] = await Promise.all([
    User.find({ _id: { $in: idsByModel.User } }).select("name phone"),
    Rider.find({ _id: { $in: idsByModel.Rider } }).select("fullLegalName firstName lastName phone"),
    Admin.find({ _id: { $in: idsByModel.Admin } }).select("name email"),
  ]);

  const nameMap = new Map();
  for (const u of users) nameMap.set(u._id.toString(), u.name || u.phone);
  for (const r of riders) nameMap.set(r._id.toString(), r.fullLegalName || [r.firstName, r.lastName].filter(Boolean).join(" ") || r.phone);
  for (const a of admins) nameMap.set(a._id.toString(), a.name || a.email);

  return notifications.map((n) => ({
    id: n._id,
    title: n.title,
    body: n.body,
    type: n.type,
    recipientModel: n.recipientModel,
    recipientName: nameMap.get(n.recipient.toString()) || "Unknown",
    isRead: n.isRead,
    readAt: n.readAt,
    createdAt: n.createdAt,
  }));
};

// GET /api/v1/admin/notifications
exports.getNotifications = catchAsync(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
  const { type, recipientModel, read, search } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (recipientModel && ["User", "Rider", "Admin"].includes(recipientModel)) filter.recipientModel = recipientModel;
  if (read === "read") filter.isRead = true;
  if (read === "unread") filter.isRead = false;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: regex }, { body: regex }];
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.json({
    success: true,
    notifications: await attachRecipientNames(notifications),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/v1/admin/notifications/stats
exports.getNotificationStats = catchAsync(async (req, res) => {
  const [total, unread, sentToday] = await Promise.all([
    Notification.countDocuments({}),
    Notification.countDocuments({ isRead: false }),
    Notification.countDocuments({ createdAt: { $gte: startOfDay() } }),
  ]);

  res.json({ success: true, total, unread, sentToday });
});

// POST /api/v1/admin/notifications/broadcast
// Creates a real Notification record for every recipient in the target
// audience (always), and additionally delivers a real Firebase push to
// whichever of them have a registered device token (fcmToken, saved via
// PATCH /auth/fcm-token by the Flutter app). Recipients without a saved
// token still get the in-app record — push is best-effort on top of that.
exports.sendBroadcast = catchAsync(async (req, res, next) => {
  const { title, body, type, target } = req.body;

  if (!title || !title.trim()) return next(new AppError("Title is required.", 400));
  if (!body || !body.trim()) return next(new AppError("Message body is required.", 400));
  if (!BROADCAST_TYPES.includes(type)) return next(new AppError("Invalid notification type.", 400));
  if (!["all_users", "all_riders"].includes(target)) return next(new AppError("Invalid target audience.", 400));

  const recipientModel = target === "all_users" ? "User" : "Rider";
  const Model = recipientModel === "User" ? User : Rider;
  const audienceFilter =
    recipientModel === "User" ? { isDeleted: false, status: "active" } : { accountStatus: "approved" };

  const recipients = await Model.find(audienceFilter).select("_id fcmToken");
  if (recipients.length === 0) {
    return next(new AppError(`No ${target === "all_users" ? "active users" : "approved riders"} to notify.`, 400));
  }

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const now = new Date();

  const docs = recipients.map((r) => ({
    recipient: r._id,
    recipientModel,
    title: trimmedTitle,
    body: trimmedBody,
    type,
    channels: r.fcmToken ? ["in_app", "push"] : ["in_app"],
    // In-app is just a DB write, so it's "sent" the moment it's created.
    // Push recipients start pending and get updated once FCM responds below.
    isSent: !r.fcmToken,
    sentAt: r.fcmToken ? undefined : now,
  }));

  const created = await Notification.insertMany(docs);

  const pushable = recipients
    .map((r, i) => ({ recipientId: r._id.toString(), token: r.fcmToken, notifId: created[i]._id }))
    .filter((r) => r.token);

  let pushSummary = null;

  if (pushable.length > 0) {
    try {
      const tokenToNotif = new Map(pushable.map((r) => [r.token, r.notifId]));
      const allDeadTokens = [];
      const bulkNotifUpdates = [];
      let successCount = 0;

      for (const batch of chunk(pushable.map((r) => r.token), FCM_BATCH_SIZE)) {
        const { results, deadTokens } = await sendPushToTokens(batch, {
          title: trimmedTitle,
          body: trimmedBody,
          data: { type, screen: recipientModel === "User" ? "Notifications" : "RiderNotifications" },
        });
        allDeadTokens.push(...deadTokens);

        for (const r of results) {
          if (r.success) successCount += 1;
          const notifId = tokenToNotif.get(r.token);
          if (!notifId) continue;
          bulkNotifUpdates.push({
            updateOne: {
              filter: { _id: notifId },
              update: r.success
                ? { isSent: true, sentAt: new Date() }
                : { isSent: false, failedReason: r.error || "Unknown FCM error" },
            },
          });
        }
      }

      if (bulkNotifUpdates.length) await Notification.bulkWrite(bulkNotifUpdates);

      // Tokens Firebase reports as permanently invalid — clear them so future
      // broadcasts don't keep wasting a send attempt on a dead device.
      if (allDeadTokens.length) {
        const deadSet = new Set(allDeadTokens);
        const deadRecipientIds = pushable.filter((r) => deadSet.has(r.token)).map((r) => r.recipientId);
        await Model.updateMany({ _id: { $in: deadRecipientIds } }, { fcmToken: null });
      }

      pushSummary = `, ${successCount}/${pushable.length} push notification(s) delivered`;
    } catch (err) {
      console.error("FCM broadcast send error:", err);
      pushSummary = ", push delivery failed (in-app notifications were still created)";
    }
  }

  res.status(201).json({
    success: true,
    message: `Notification sent to ${docs.length} ${recipientModel === "User" ? "user(s)" : "rider(s)"}${pushSummary || " (no registered devices to push to)"}.`,
    recipientCount: docs.length,
    pushableCount: pushable.length,
  });
});
