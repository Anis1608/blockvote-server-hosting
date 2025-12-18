import jwt from 'jsonwebtoken';
import redis from '../redisClient.js';
import AdminData from '../models/Admin.js';
import "dotenv/config"

const SECRET_KEY = process.env.SECRET_KEY;
const SESSION_TTL = 7200; 

export const isadmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const deviceId = req.headers['device-id'];

  if (!token || !deviceId) {
    return res.status(401).json({ message: "Token or Device ID Missing", success: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const sessionKey = `session:${decoded.id}:${deviceId}`;
    const deviceInfoKey = `device-info:${decoded.id}:${deviceId}`;

    const redisToken = await redis.get(sessionKey);
    if (!redisToken || redisToken !== token) {
      return res.status(401).json({ message: "Session Invalid or Expired", success: false });
    }

    // Refresh TTL for both session and device info
    await redis.set(sessionKey, token, 'EX', SESSION_TTL);

    const existingDeviceInfo = await redis.get(deviceInfoKey);
    if (existingDeviceInfo) {
      await redis.set(deviceInfoKey, existingDeviceInfo, 'EX', SESSION_TTL);
    }

    const admin = await AdminData.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin Not Found", success: false });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("isadmin error:", error);
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};
