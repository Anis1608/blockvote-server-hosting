import express from "express";
import { isadmin } from "../middleware/checkisadmin.js";
import { Register,  verifyRegisterOTP , getalladminsID  ,verifyLoginOTP,AdminLogin , Register_Voter  , getvoterDetails , totalRegisterVoter , getAllLoggedInDevices , getDetails} from "../controllers/adminController.js";

const adminRoutes = express.Router()

adminRoutes.route("/admin-register").post(Register)
adminRoutes.route("/verify-register-otp").post(verifyRegisterOTP)
adminRoutes.route("/admin-login").post(AdminLogin)
adminRoutes.route("/verify-login-otp").post(verifyLoginOTP)
adminRoutes.route("/register-voter").post( isadmin , Register_Voter)
adminRoutes.route("/admins").get(getalladminsID)
adminRoutes.route("/allvoter").get( isadmin , getvoterDetails)
adminRoutes.route("/register-votercount").get(isadmin , totalRegisterVoter)
adminRoutes.route("/get-active-devices").get(isadmin , getAllLoggedInDevices)
adminRoutes.route("/get-details").get( isadmin ,getDetails)
// adminRoutes.route("/logout").post( isadmin ,logout)

export default adminRoutes;