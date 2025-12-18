import exprss from 'express';
import { downloadStellarCSV, gethourlyVotesonblockchain, getCandidateVotesbyadmin, getCandidateVotesbyadminforPublc  , totalvotesofallcandidate} from '../controllers/resultController.js';
import { isadmin } from '../middleware/checkisadmin.js';

const resultRoutes = exprss.Router();

resultRoutes.route("/admin-result").get(isadmin , getCandidateVotesbyadmin);
resultRoutes.route("/public-result").get(getCandidateVotesbyadminforPublc);
resultRoutes.route("/total-votes").get(isadmin , totalvotesofallcandidate);
resultRoutes.route("/downloadStellar").get( isadmin , downloadStellarCSV);
resultRoutes.route("/hourly").get( isadmin, gethourlyVotesonblockchain);

export default resultRoutes;