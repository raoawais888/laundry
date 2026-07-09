const mongoose = require("mongoose");

const riderDocumentSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", required: true, index: true },

    docType: {
      type: String,
      enum: [
        "driver_license",
        "passport",
        "selfie",
        "medicare",
        "visa",
        "vevo",
        "police_check",
        "insurance",
      ],
      required: true,
    },

    frontImage: { type: String },
    backImage: { type: String },

    // extra structured fields depending on docType
    documentNumber: { type: String, trim: true }, // police check no., license no. etc.
    expiryDate: { type: Date }, // visa expiry, police check expiry
    visaType: { type: String, trim: true },

    status: {
      type: String,
      enum: ["in_review", "passed", "rejected"],
      default: "in_review",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

riderDocumentSchema.index({ rider: 1, docType: 1 }, { unique: true });

module.exports = mongoose.model("RiderDocument", riderDocumentSchema);