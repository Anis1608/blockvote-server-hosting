import AdminData from "../models/Admin.js";
import redis from "../redisClient.js";
import { generateOTP, sendOTPByEmail } from "../Utils/otp.js";

export const requestLogoutFromDevice = async (req, res) => {
  const { deviceId } = req.body;
  const email = req.admin?.email;
  const currentDeviceId = req.headers['device-id'];

  if (!deviceId) {
    return res.status(400).json({ message: "Device ID is required", success: false });
  }

  if (deviceId === currentDeviceId) {
    return res.status(400).json({ message: "Cannot logout current device", success: false });
  }

  try {
    const otp = generateOTP();
    await redis.set(`otp:logout:${email}:${deviceId}`, otp, "EX", 300); // 5 minutes expiry
    
    await sendOTPByEmail(email, otp, "logoutDevice");
    
    return res.status(200).json({ 
      message: "OTP sent to your email", 
      success: true 
    });
  } catch (error) {
    console.error("Error in requestLogoutFromDevice:", error);
    return res.status(500).json({ 
      message: "Failed to process logout request", 
      success: false 
    });
  }
};
export const verifyLogoutOTP = async (req, res) => {
  const { deviceId, otp } = req.body;
  const email = req.admin?.email;
  const adminId = req.admin?._id?.toString();

  if (!deviceId || !otp) {
    return res.status(400).json({ message: "Device ID and OTP are required", success: false });
  }

  try {
    const storedOtp = await redis.get(`otp:logout:${email}:${deviceId}`);
    
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ 
        message: "Invalid or expired OTP", 
        success: false 
      });
    }
    const sessionKey = `session:${adminId}:${deviceId}`;
    const deviceInfoKey = `device-info:${adminId}:${deviceId}`;
    await redis.del(sessionKey);
    await redis.del(deviceInfoKey);
    await redis.del(`otp:logout:${email}:${deviceId}`);

    return res.status(200).json({ 
      message: "Device logged out successfully", 
      success: true 
    });
  } catch (error) {
    console.error("Error in verifyLogoutOTP:", error);
    return res.status(500).json({ 
      message: "Failed to verify OTP", 
      success: false 
    });
  }
};
