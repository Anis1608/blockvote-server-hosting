import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin Details" },
  action: { type: String, required: true }, // e.g., "login", "password_reset"
  description: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ["success", "failed"] },
  metadata: { type: Object }, // Additional data
  createdAt: { type: Date, default: Date.now }
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;