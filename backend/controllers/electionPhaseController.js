import { logActivity } from "../middleware/activityLogger.js";
import AdminData from "../models/Admin.js";
import redis from "../redisClient.js";
import { generateOTP, sendOTPByEmail, storeOTP, verifyOTP } from "../Utils/otp.js";

export const getCurrentPhase = async (req, res) => {
    const adminId = req.admin?.id_no;
    // console.log(adminId)
    const admin = await AdminData.findOne({ id_no: adminId });
    // console.log(admin)
    if (!admin) {
      return res.status(404).json({ message: "Admin not found", Success: false });
    }
  
    return res.status(200).json({
      Success: true,
      currentPhase: admin.currentPhase,
    });
  };
  
  export const electionPhase = async (req, res) => {
    const { currentPhase } = req.body;
    const email = req.admin?.email;
  
    if (!currentPhase) {
      return res.status(400).json({ message: "Something is Missing...", Success: false });
    }
    const changephaseOtp =  generateOTP();
    await storeOTP(`changePhase:${email}`, changephaseOtp);
    await sendOTPByEmail(email, changephaseOtp , "changePhase");

    const tempData = {
      currentPhase,
      email,
    };
    await redis.set(`temp:changePhase:${email}` , JSON.stringify(tempData), "EX", 600);
    return res.status(200).json({ message: "OTP Sent to Email. Please verify to Change Election phase.", Success: true });
  };


  export const verifyOTPforChangePhase = async (req, res) => {
    const { otp } = req.body;
    const email = req.admin?.email;
  
    if (!otp) {
      return res.status(400).json({ message: "OTP is required", Success: false });
    }
    const valid = await verifyOTP(`changePhase:${email}`, otp);
      if (!valid) {
        return res.status(400).json({ message: "Invalid or expired OTP", Success: false });
      }
  
    const data = await redis.get(`temp:changePhase:${email}`);
  
    if (!data) {
      return res.status(400).json({ message: "Session exprired Request Otp again", Success: false });
    }
  
    const adminId = req.admin?.id_no;
    const redisdata = await redis.get(`temp:changePhase:${email}`);
    // console.log({currentPhase:currentPhase})
    const tempData = JSON.parse(redisdata);
    const currentPhase = tempData.currentPhase;
    // console.log(currentPhase)

  
    await AdminData.findOneAndUpdate({ id_no: adminId }, { $set: { currentPhase } });
    await redis.del(`changephaseOtp:changePhase:${email}`);
    await redis.del(`temp:changePhase:${email}`);

     await logActivity(req, "change_election_phase", "success", {currentPhase})
  
    return res.status(200).json({ message: "Election phase updated successfully", Success: true });
  }
  