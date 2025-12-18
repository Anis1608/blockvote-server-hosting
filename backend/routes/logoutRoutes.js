import express from "express";
import { 
  requestLogoutFromDevice, 
  verifyLogoutOTP 
} from "../controllers/logoutController.js";
import {isadmin} from "../middleware/checkisadmin.js";

const logoutRoutes = express.Router();

logoutRoutes.post("/request-device-logout", isadmin, requestLogoutFromDevice);
logoutRoutes.post("/verify-logout-otp", isadmin, verifyLogoutOTP);

export default logoutRoutes;