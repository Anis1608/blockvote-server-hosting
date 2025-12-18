import AdminData from "../models/Admin.js";
import { sendOTPByEmail, generateOTP, storeOTP, verifyOTP } from "../Utils/otp.js";
import bcrypt from "bcryptjs";
import redis from "../redisClient.js";

export const sendforgotpasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required", Success: false });
        }
        
        const adminCheck = await AdminData.findOne({ email });
        if (!adminCheck) {
            return res.status(400).json({ message: "Admin Not Found", Success: false });
        }
        
        const otp = generateOTP();
        await storeOTP(`forgot:${email}`, otp);
        await sendOTPByEmail(email, otp, "forgotpassword");
        
        // Store only email in temp data, password will be hashed after OTP verification
        await redis.set(`temp:forgot:${email}`, email, "EX", 600); // 10 min
        
        return res.status(200).json({ 
            message: "OTP sent to email. Please verify to reset password.", 
            Success: true 
        });
    } catch (error) {
        console.error("Error in sendforgotpasswordOtp:", error);
        return res.status(500).json({ message: "Internal server error", Success: false });
    }
}

export const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                message: "Missing OTP, email or new password", 
                Success: false 
            });
        }
        
        const valid = await verifyOTP(`forgot:${email}`, otp);
        if (!valid) { 
            return res.status(400).json({ message: "Invalid or expired OTP", Success: false });
        }
        
        const storedEmail = await redis.get(`temp:forgot:${email}`);
        if (!storedEmail || storedEmail !== email) {
            return res.status(400).json({ message: "Session expired", Success: false });
        }
        
        // Hash the new password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);
        
        // Update admin password
        await AdminData.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );
        
        // Clean up
        await redis.del(`otp:forgot:${email}`);
        await redis.del(`temp:forgot:${email}`);
        
        return res.status(200).json({ 
            message: "Password reset successfully", 
            Success: true 
        });
    } catch (error) {
        console.error("Error in verifyForgotPasswordOTP:", error);
        return res.status(500).json({ message: "Internal server error", Success: false });
    }
}
