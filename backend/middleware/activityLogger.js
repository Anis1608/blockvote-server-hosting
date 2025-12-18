import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async (req, action, status, metadata = {}) => {
  try {
    await ActivityLog.create({
      userId: req.admin?._id || null,
      action,
      description: getActionDescription(action),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      status,
      metadata
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

function getActionDescription(action) {
  const descriptions = {
    login: "User logged in",
    logout: "User logged out",
    password_reset: "User reset password",
    profile_update: "User updated profile",
    change_election_phase: "changed election phase",
    candidate_registration: "Registered a new candidate",
    vote_cast: "Voter cast a vote",
    bulk_voter_registration: "Bulk voter registration",
    
    // Add more as needed
  };
  return descriptions[action] || action;
}