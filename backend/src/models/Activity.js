// src/models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String },
    action: { type: String, required: true }, // e.g., "reported", "updated status"
    targetType: { type: String }, // e.g., "Bug"
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetTitle: { type: String },
    meta: { type: Object }, // optional extra info (oldStatus/newStatus etc.)
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
