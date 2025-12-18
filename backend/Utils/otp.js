import redis from "../redisClient.js";
import nodemailer from "nodemailer";
import "dotenv/config"

// Constants
const OTP_EXPIRY = 300; // 5 minutes in seconds
const MAX_OTP_ATTEMPTS = 5;
const OTP_ATTEMPTS_WINDOW = 3600; // 1 hour in seconds

// Email configuration
const emailConfig = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASSWORD 
  }
};

// Create reusable transporter object
const transporter = nodemailer.createTransport(emailConfig);

// Generate secure OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with rate limiting
export const storeOTP = async (key, otp) => {
  const attemptsKey = `otp_attempts:${key}`;
  const currentAttempts = await redis.get(attemptsKey) || 0;

  if (currentAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many OTP requests. Please try again later.");
  }

  await redis.multi()
    .set(`otp:${key}`, otp, "EX", OTP_EXPIRY)
    .incr(attemptsKey)
    .expire(attemptsKey, OTP_ATTEMPTS_WINDOW)
    .exec();
};

// Verify OTP with cleanup
export const verifyOTP = async (key, otp) => {
  const stored = await redis.get(`otp:${key}`);
  
  if (stored === otp) {
    await redis.del(`otp:${key}`);
    await redis.del(`otp_attempts:${key}`);
    return true;
  }
  
  return false;
};

// Email template generator
const generateEmailTemplate = (action, otp, additionalData = {}) => {
  const templates = {
    registration: {
      subject: "Your BlockVote Registration OTP",
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4a6bff, #6a11cb); padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0;">BlockVote Registration</h1>
          </div>
          <div style="padding: 25px;">
            <p>Dear User,</p>
            <p>Thank you for registering with BlockVote. Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; font-size: 24px; font-weight: bold;">
              ${otp}
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this registration, please ignore this email.</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>BlockVote - Secure Voting Platform</p>
          </div>
        </div>
      `
    },
    changePhase: {
      subject: "Election Phase Change Verification - BlockVote",
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0;">Election Phase Change</h1>
          </div>
          <div style="padding: 25px;">
            <p>Dear Admin,</p>
            <p>You have requested to change the election phase. Your verification code is:</p>
            <div style="background: #fee2e2; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; font-size: 24px; font-weight: bold; color: #b91c1c;">
              ${otp}
            </div>
            <p style="color: #b91c1c; font-weight: bold;">Important: This action will affect the entire election process.</p>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this change, please secure your account immediately.</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>BlockVote - Secure Voting Platform</p>
          </div>
        </div>
      `
    },
    logoutDevice: {
      subject: "Device Logout Verification - BlockVote",
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0;">Device Logout Request</h1>
          </div>
          <div style="padding: 25px;">
            <p>Dear User,</p>
            <p>You have requested to logout a device from your account. Your verification code is:</p>
            <div style="background: #fef3c7; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; font-size: 24px; font-weight: bold; color: #b45309;">
              ${otp}
            </div>
            <p style="color: #b45309; font-weight: bold;">Important: This will immediately log out the selected device.</p>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this, please secure your account immediately.</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>BlockVote - Secure Voting Platform</p>
          </div>
        </div>
      `
    },
    voterId: {
      subject: "Your BlockVote Voter ID",
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0;">Voter Registration Complete</h1>
          </div>
          <div style="padding: 25px;">
            <p>Dear ${additionalData.name || 'Voter'},</p>
            <p>Your voter registration with BlockVote has been successfully processed.</p>
            <div style="background: #d1fae5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="font-weight: bold; margin: 0 0 10px 0;">Your Voter ID:</p>
              <p style="font-size: 20px; font-weight: bold; text-align: center; margin: 0;">${additionalData.voterId || 'N/A'}</p>
            </div>
            <p>Please keep this information safe as it will be required for voting.</p>
            <p>Thank you for registering with BlockVote.</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>BlockVote - Secure Voting Platform</p>
            <p>If you didn't request this registration, please contact our support team immediately.</p>
          </div>
        </div>
      `
    },
    default: {
      subject: "Your BlockVote Verification Code",
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 25px; text-align: center; color: white;">
            <h1 style="margin: 0;">Verification Code</h1>
          </div>
          <div style="padding: 25px;">
            <p>Dear User,</p>
            <p>Your verification code is:</p>
            <div style="background: #e0e7ff; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; font-size: 24px; font-weight: bold;">
              ${otp}
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>BlockVote - Secure Voting Platform</p>
          </div>
        </div>
      `
    }
  };

  return templates[action] || templates.default;
};

// Send OTP by email
export const sendOTPByEmail = async (email, otp, action = "default") => {
  try {
    const template = generateEmailTemplate(action, otp);
    
    const mailOptions = {
      from: `"BlockVote" <${emailConfig.auth.user}>`,
      to: email,
      subject: template.subject,
      text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
      html: template.html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Send voter ID by email
export const sendVoterIdonEmail = async (email, voterId, name) => {
  try {
    const template = generateEmailTemplate("voterId", null, { voterId, name });
    
    const mailOptions = {
      from: `"BlockVote" <${emailConfig.auth.user}>`,
      to: email,
      subject: template.subject,
      text: `Your Voter ID is ${voterId}. Please keep this information safe.`,
      html: template.html
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending voter ID email:", error);
    throw new Error("Failed to send voter ID email");
  }
};

// Remove the bulk OTP sending function as it's a security risk