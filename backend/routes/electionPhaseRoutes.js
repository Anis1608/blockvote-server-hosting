import express from 'express';
import { electionPhase , getCurrentPhase, verifyOTPforChangePhase } from '../controllers/electionPhaseController.js';
import { isadmin } from "../middleware/checkisadmin.js";

const electionPhaseRouter = express.Router();

electionPhaseRouter.route("/changephase").post( isadmin , electionPhase)
electionPhaseRouter.route("/get-current-phase").get(isadmin , getCurrentPhase)
electionPhaseRouter.route("/changephase/verify").post(isadmin , verifyOTPforChangePhase)

export default electionPhaseRouter;