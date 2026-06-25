const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // one review per order
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      index: true,
    },

    // ── Rider Rating ──────────────────────────────────────────────────────────
    riderRating: { type: Number, min: 1, max: 5 },
    riderFeedback: { type: String, maxlength: 500 },
    riderTags: [
      {
        type: String,
        enum: [
          "on_time",
          "professional",
          "friendly",
          "careful",
          "late",
          "unprofessional",
        ],
      },
    ],

    // ── Laundry Rating ────────────────────────────────────────────────────────
    laundryRating: { type: Number, min: 1, max: 5 },
    laundryFeedback: { type: String, maxlength: 500 },
    laundryTags: [
      {
        type: String,
        enum: [
          "excellent_quality",
          "good_packaging",
          "fresh_smell",
          "stain_removed",
          "damaged_clothes",
          "stain_not_removed",
          "poor_quality",
        ],
      },
    ],

    // ── Overall ───────────────────────────────────────────────────────────────
    overallRating: { type: Number, min: 1, max: 5 },
    overallFeedback: { type: String, maxlength: 500 },

    // ── Response ──────────────────────────────────────────────────────────────
    adminReply: String,
    adminRepliedAt: Date,

    // ── Media ─────────────────────────────────────────────────────────────────
    photos: [
      {
        url: String,
        publicId: String,
      },
    ],

    isVisible: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
  },
  { timestamps: true }
);

reviewSchema.index({ rider: 1, createdAt: -1 });
reviewSchema.index({ laundryRating: 1, overallRating: 1 });

// ── Post-save: update rider average rating ─────────────────────────────────────
reviewSchema.post("save", async function () {
  if (this.rider && this.riderRating) {
    const Rider = mongoose.model("Rider");
    const stats = await mongoose
      .model("Review")
      .aggregate([
        { $match: { rider: this.rider, riderRating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: "$riderRating" }, count: { $sum: 1 } } },
      ]);
    if (stats.length) {
      await Rider.findByIdAndUpdate(this.rider, {
        rating: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }
  }
});

module.exports = mongoose.model("Review", reviewSchema);