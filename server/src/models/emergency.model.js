const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["FLOOD", "FIRE", "EARTHQUAKE", "ACCIDENT", "CYCLONE", "OTHER"],
    },
    description: { type: String },
    phone: { type: String },
    status: { type: String, default: "OPEN", enum: ["OPEN", "ACK", "RESOLVED"] },
    severity: {
      type: String,
      default: "MEDIUM",
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },
    address: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    reportedBy: { type: String, default: "ANONYMOUS" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Emergency", emergencySchema);
