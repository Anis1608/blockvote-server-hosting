import AdminData from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Bowser from "bowser";
import VoterData from "../models/Voter.js";
import StellarSdk from "stellar-sdk";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import redis from "../redisClient.js";
import {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTPByEmail,
  sendVoterIdonEmail,
} from "../Utils/otp.js";
import { logActivity } from "../middleware/activityLogger.js";


const SECRET_KEY = process.env.SECRET_KEY;

// ============================== ADMIN AUTH ==============================

export const Register = async (req, res) => {
  const { name, id_no, email, password , profile } = req.body;

  if (!name || !id_no || !email || !password) {
    return res.status(400).json({ message: "Something is Missing...", Success: false });
  }

  const checkadmin = await AdminData.findOne({ id_no });
  if (checkadmin) {
    return res.status(400).json({ message: "Admin Already Registered...", Success: false });
  }

  const otp = generateOTP();
  await storeOTP(`register:${email}`, otp);
  await sendOTPByEmail(email, otp , "registration");

  const tempData = { name, id_no, email, password , profile };
  await redis.set(`temp:register:${email}`, JSON.stringify(tempData), "EX", 600); // 10 min

  return res.status(200).json({
    message: "OTP Sent to Email. Please verify to complete registration.",
    Success: true,
  });
};

export const verifyRegisterOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Missing OTP or email", Success: false });
  }

  const valid = await verifyOTP(`register:${email}`, otp);
  if (!valid) {
    return res.status(400).json({ message: "Invalid or expired OTP", Success: false });
  }

  const data = await redis.get(`temp:register:${email}`);
  if (!data) {
    return res.status(400).json({ message: "Registration session expired", Success: false });
  }

  const { name, id_no, password ,profile } = JSON.parse(data);
  const keypair = StellarSdk.Keypair.random();
  const walletAddress = keypair.publicKey();
  const walletSecret = keypair.secret();

  try {
    await axios.get(`https://friendbot.stellar.org/?addr=${walletAddress}`);
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await AdminData.create({
      name,
      id_no,
      email,
      password: hashedPassword,
      profile,
      walletAddress,
      walletSecret,
    });

    await redis.del(`otp:register:${email}`);
    await redis.del(`temp:register:${email}`);

    return res.status(200).json({ message: "Registration Successful!", Success: true });
  } catch (error) {
    console.error("Wallet funding error:", error);
    return res.status(500).json({ message: "Registration Failed", Success: false });
  }
};

export const AdminLogin = async (req, res) => {
  const { id_no, email, password } = req.body;
  if (!email || !password || !id_no) {
    return res.status(400).json({ message: "Something is Missing...", Success: false });
  }

  const checkAdmin = await AdminData.findOne({ id_no });
  if (!checkAdmin) {
    return res.status(400).json({ message: "Admin Not Found...", Success: false });
  }

  const comparePassword = bcrypt.compareSync(password, checkAdmin.password);
  if (!comparePassword) {
    return res.status(400).json({ message: "Password is Incorrect...", Success: false });
  }

  const otp = generateOTP();
  await storeOTP(`login:${email}`, otp);
  await sendOTPByEmail(email, otp);
  await redis.set(`temp:login:${email}`, checkAdmin._id.toString(), "EX", 600);

  return res.status(200).json({ message: "OTP sent to email. Please verify to login.", Success: true });
};

export const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  const userAgent = req.headers["user-agent"];
  const deviceId = req.headers["device-id"] || uuidv4();

  const valid = await verifyOTP(`login:${email}`, otp);
  if (!valid) {
    return res.status(400).json({ message: "Invalid or expired OTP", Success: false });
  }

  const adminId = await redis.get(`temp:login:${email}`);
  if (!adminId) {
    return res.status(400).json({ message: "Session expired", Success: false });
  }

  const checkAdmin = await AdminData.findById(adminId);
  if (!checkAdmin) {
    return res.status(400).json({ message: "Admin Not Found", Success: false });
  }

  const browser = Bowser.getParser(userAgent);
  const parsedInfo = browser.getResult();
  const deviceInfo = {
    os: parsedInfo.os.name + " " + parsedInfo.os.versionName,
    browser: parsedInfo.browser.name + " " + parsedInfo.browser.version,
    platform: parsedInfo.platform.type,
  };

  const token = jwt.sign({ id: checkAdmin._id }, SECRET_KEY);
  const redisKey = `session:${checkAdmin._id}:${deviceId}`;
  await redis.set(redisKey, token, "EX", 3600);
  await redis.set(`device-info:${checkAdmin._id}:${deviceId}`, JSON.stringify(deviceInfo), "EX", 3600);

  await redis.del(`otp:login:${email}`);
  await redis.del(`temp:login:${email}`);

  return res.status(200).json({
    message: "Admin Logged In Successfully!",
    Success: true,
    token,
    deviceId,
    deviceInfo,
    walletAddress: checkAdmin.walletAddress,
  });
};

export const getalladminsID = async (req, res) => {
  try {
    const admins = await AdminData.find({}).select("_id name walletAddress currentPhase");
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No Admin Found", Success: false });
    }
    res.status(200).json({ message: "All Admins...", Success: true, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong...", Success: false });
  }
};



export const getDetails = async (req, res) => {
  try {
    const adminId = req.admin.id_no;
    const adminDetails = await AdminData.find({ id_no: adminId }).select("-password -walletSecret");
    if (!adminDetails) {
      return res.status(404).json({ message: "Admin Not Found", Success: false });
    }
    res.status(200).json({ message: "Admin Details...", Success: true, adminDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong...", Success: false });
  }
};

// export const logout = async (req, res) => {
//   try {
//     const adminId = req.admin._id.toString();
//     const deviceId = req.headers["device-id"];
//     if (!deviceId) return res.status(400).json({ message: "Device ID missing", Success: false });

//     const redisKey = `session:${adminId}:${deviceId}`;
//     const deviceInfoKey = `device-info:${adminId}:${deviceId}`;
//     const deleted = await redis.del(redisKey);
//     await redis.del(deviceInfoKey);

//     if (deleted === 0) {
//       return res.status(404).json({ message: "Session not found", Success: false });
//     }

//     return res.status(200).json({ message: "Logout successful", Success: true });
//   } catch (error) {
//     console.error("Logout error:", error);
//     res.status(500).json({ message: "Logout failed", Success: false });
//   }
// };

export const getAllLoggedInDevices = async (req, res) => {
  try {
    const adminId = req.admin._id.toString();
    const pattern = `session:${adminId}:*`;
    const sessionKeys = await redis.keys(pattern);

    const devices = [];
    for (const key of sessionKeys) {
      const parts = key.split(":");
      const deviceId = parts[2];
      const token = await redis.get(key);
      const deviceInfoRaw = await redis.get(`device-info:${adminId}:${deviceId}`);
      const deviceInfo = deviceInfoRaw ? JSON.parse(deviceInfoRaw) : {};
      devices.push({ deviceId, token, deviceInfo });
    }

    res.status(200).json({
      success: true,
      devices,
      message: `Active devices for admin ${adminId}`,
    });
  } catch (error) {
    console.error("Error fetching active devices:", error);
    res.status(500).json({ success: false, message: "Error fetching devices" });
  }
};

//  VOTERS 

export const Register_Voter = async (req, res) => {
  const { voterId, name, dob, location , email} = req.body;
  const adminId = req.admin._id;
  const currentPhase = req.admin.currentPhase;

  const alreadyRegister = await VoterData.findOne({email , admin: adminId});
  if (alreadyRegister) {
    return res.status(400).json({ message: "Email Already Registered...", Success: false });
  }
  if (currentPhase !== "Registration") {
    return res.status(400).json({ 
      message: "Voter Registration Phase is Closed...", 
      Success: false 
    });
  }
  
  // 2. Check for missing fields
  if (!voterId || !name || !dob || !location || !email) {
    return res.status(400).json({ 
      message: "Something is Missing...", 
      Success: false 
    });
  }
  const voterDob = new Date(dob);
  const currentDate = new Date();

  if (isNaN(voterDob.getTime())) {
    return res.status(400).json({ 
      message: "Invalid Date of Birth...", 
      Success: false 
    });
  }
  if (voterDob > currentDate) {
    return res.status(400).json({ 
      message: "Date of Birth cannot be in the future...", 
      Success: false 
    });
  }
  let age = currentDate.getFullYear() - voterDob.getFullYear();
  const monthDiff = currentDate.getMonth() - voterDob.getMonth();
  const dayDiff = currentDate.getDate() - voterDob.getDate();
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  
  if (age < 18) {
    return res.status(400).json({ 
      message: "Voter Must be at least 18 Years Old...", 
      Success: false 
    });
  } 
  if (age > 120) {
    return res.status(400).json({ 
      message: "Voter Age is Invalid (Maximum 120 years)...", 
      Success: false 
    });
  }
  const checkVoter = await VoterData.findOne({ voterId, admin: adminId });
  if (checkVoter) {
    return res.status(400).json({ message: "Voter Already Registered under this Admin...", Success: false });
  }

  const voterDetails = await VoterData.create({
    admin: adminId,
    voterId,
    name,
    dob,
    email,
    location,
  });
  await logActivity(req, "voter_registration", "success", { name });
  // console.log(voterDetails.voterId)
  await sendVoterIdonEmail(voterDetails.email, voterDetails.voterId);
  res.status(200).json({ message: "Voter Registered Successfully...", Success: true, voterDetails });
};

export const getvoterDetails = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const getDetails = await VoterData.find({ admin: adminId });

    if (!getDetails || getDetails.length === 0) {
      return res.status(400).json({ message: "No Voter Found for this Admin...", Success: false });
    }
    res.status(200).json({ message: "All Voters for this Admin...", Success: true, getDetails });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Something Went Wrong...", Success: false });
  }
};

export const totalRegisterVoter = async (req, res) => {
  try {
    const adminId = req.admin._id; // coming from your isAdmin middleware
    const totalVoterCount = await VoterData.countDocuments({ admin: adminId });

    if (totalVoterCount === 0) {
      return res.status(404).json({
        message: "No Voter Found...",
        Success: false,
        totalVoter: 0
      });
    }

    res.status(200).json({
      message: "Total Voter Count...",
      Success: true,
      totalVoter: totalVoterCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something Went Wrong...",
      Success: false
    });
  }
};
