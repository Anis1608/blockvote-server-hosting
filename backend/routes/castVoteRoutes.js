import express from "express";
import  { castVote , voter_login }  from "../controllers/castVote.js";
import { isadmin } from "../middleware/checkisadmin.js";

const castVoteRoutes = express.Router()

castVoteRoutes.route("/cast-vote").post(isadmin , castVote)
castVoteRoutes.route("/voter-login").post(isadmin , voter_login)

export default castVoteRoutes;