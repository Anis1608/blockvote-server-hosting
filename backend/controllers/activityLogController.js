import ActivityLog from "../models/ActivityLog.js";

export const getActivityLogs = async (req, res) => {
  try {
    const adminId = req.admin._id;
    // console.log(adminId)
    const { page = 1, limit = 20 } = req.query;
    
    const logs = await ActivityLog.find({ userId: adminId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "email name");
      
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};