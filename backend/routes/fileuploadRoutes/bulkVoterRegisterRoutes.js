import express from "express";
import upload from "../../middleware/fileUpload.js";
import { bulkRegisterVoters } from "../../controllers/fileupload/bulkVoterRegisterController.js";
import { isadmin } from "../../middleware/checkisadmin.js";

const bulkVoterRegisterRoutes = express.Router();

bulkVoterRegisterRoutes.post("/bulk-register",isadmin,upload.single("file"),bulkRegisterVoters);

export default bulkVoterRegisterRoutes;
