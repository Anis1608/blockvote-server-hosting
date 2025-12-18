import express from "express";
import { sendforgotpasswordOtp, verifyForgotPasswordOTP } from "../controllers/forgotpasswordAdminController.js";

const forgotpasswordAdminRoutes = express.Router()
forgotpasswordAdminRoutes.route("/forgot-password").post(sendforgotpasswordOtp)
forgotpasswordAdminRoutes.route("/forgot-password/verify").post(verifyForgotPasswordOTP)

export default forgotpasswordAdminRoutes;