const express = require("express");
const router = express.Router();
const AdminDashboard = require("../controllers/admin.dashboard.controller.js");
const AdminOrder = require("../controllers/admin.order.controller.js");
const AdminUser = require("../controllers/admin.user.controller.js");
const AdminRider = require("../controllers/admin.rider.controller.js");
const AdminPayment = require("../controllers/admin.payment.controller.js");
const AdminReview = require("../controllers/admin.review.controller.js");
const AdminService = require("../controllers/admin.service.controller.js");
const AdminNotification = require("../controllers/admin.notification.controller.js");
const AdminReport = require("../controllers/admin.report.controller.js");
const { adminAuth } = require("../middlewares/adminAuth.js");

router.get("/dashboard", adminAuth, AdminDashboard.getDashboard);

router.get("/orders", adminAuth, AdminOrder.getOrders);
router.get("/orders/assignable-riders", adminAuth, AdminOrder.getAssignableRiders);
router.get("/orders/:id", adminAuth, AdminOrder.getOrderById);
router.patch("/orders/:id/status", adminAuth, AdminOrder.updateOrderStatus);
router.patch("/orders/:id/assign-rider", adminAuth, AdminOrder.assignRider);
router.patch("/orders/:id/cancel", adminAuth, AdminOrder.cancelOrder);

router.get("/users", adminAuth, AdminUser.getUsers);
router.get("/users/:id", adminAuth, AdminUser.getUserById);
router.patch("/users/:id/status", adminAuth, AdminUser.updateUserStatus);
router.delete("/users/:id", adminAuth, AdminUser.deleteUser);

router.get("/riders", adminAuth, AdminRider.getRiders);
router.get("/riders/:id", adminAuth, AdminRider.getRiderById);
router.patch("/riders/:id/status", adminAuth, AdminRider.updateRiderStatus);

router.get("/payments", adminAuth, AdminPayment.getPayments);
router.get("/payments/stats", adminAuth, AdminPayment.getPaymentStats);

router.get("/reviews", adminAuth, AdminReview.getReviews);
router.get("/reviews/stats", adminAuth, AdminReview.getReviewStats);
router.patch("/reviews/:id/visibility", adminAuth, AdminReview.updateVisibility);
router.patch("/reviews/:id/reply", adminAuth, AdminReview.replyToReview);
router.delete("/reviews/:id", adminAuth, AdminReview.deleteReview);

router.get("/services", adminAuth, AdminService.getServices);
router.get("/services/:id", adminAuth, AdminService.getServiceById);
router.post("/services", adminAuth, AdminService.createService);
router.patch("/services/:id", adminAuth, AdminService.updateService);
router.delete("/services/:id", adminAuth, AdminService.deleteService);

router.get("/notifications", adminAuth, AdminNotification.getNotifications);
router.get("/notifications/stats", adminAuth, AdminNotification.getNotificationStats);
router.post("/notifications/broadcast", adminAuth, AdminNotification.sendBroadcast);

router.get("/reports", adminAuth, AdminReport.getReports);

module.exports = router;
