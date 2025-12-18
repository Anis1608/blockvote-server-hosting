import express from "express";
import { RegisterCandidate , getAllCandidates , getCandidateforPublic , SameCityCandidate , totalnoCandidate } from "../controllers/candidateController.js";
import { isadmin } from "../middleware/checkisadmin.js";

const candidateRoutes = express.Router()

candidateRoutes.route("/register-candidate").post(isadmin  ,RegisterCandidate )
candidateRoutes.route("/all-candidate").get(isadmin , getAllCandidates)
candidateRoutes.route("/city-candidate").get(isadmin , SameCityCandidate)
candidateRoutes.route("/total-candidate").get(isadmin ,totalnoCandidate)
candidateRoutes.route("/candidates").get(getCandidateforPublic)

export default candidateRoutes;
