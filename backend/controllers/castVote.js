import StellarSdk from "stellar-sdk";
import bcrypt from "bcryptjs";
import AdminData from "../models/Admin.js";
import "dotenv/config"
import Voter from "../models/Voter.js";
import Candidate from "../models/Candidate.js";
import { logActivity } from "../middleware/activityLogger.js";

const STELLAR_SERVER = process.env.STELLAR_SERVER; // Stellar Testnet link
// const STELLAR_SECRET = "SB4L3577Z5RYXII6S6C6JRK2MFKNPX2XRYKTKG4HQLWIWZP4W4HOFBBK"; //  Secret Key
// const STELLAR_ACCOUNT = "GB4EJAAKTHEBXOYBN3IX3EYXXN2PWMXUVIWVBYYVV274M5M3LZOZNMFX"; //  Public Key

export const castVote = async (req, res) => {
    const { voterId, candidateId } = req.body;
    const adminId = req.admin?.id_no;
    const currentPhase = req.admin?.currentPhase;
    if (currentPhase === "Registration") {
        return res.status(400).json({
            message: "Voting Phase is Not Yet Started...",
            Success: false,
        });
    }
    if (currentPhase === "Result") {
        return res.status(400).json({
            message: "Voting Phase is Closed...",
            Success: false,
        });
    }
    console.log("admin data:" , adminId)
    const server = new StellarSdk.Server(STELLAR_SERVER);
    
    try {
        const voter = await Voter.findOne({ voterId });
        // console.log(voter)
        const candidate = await Candidate.findOne({ candidateId });
        if (!voter || !candidate) {
            console.log("Voter or Candidate Not Found!");
            return res.status(404).json({Success:false  , error: "Voter or Candidate Not Found!" });
        }
        if (voter.voteCast == true) {
            console.log("Voter has already casted vote!");
            return res.status(400).json({Success:false  , error: "Voter has already casted vote!" });
        }

        const requestedAdminData = await AdminData.findOne({ id_no: adminId });
        // console.log("REquested Adimn data Fetched :" , requestedAdminData)
        const account = await server.loadAccount(requestedAdminData.walletAddress);
        const sequence = account.sequence;

        // Encyrpt Voter ID & Candidate ID
        const EncyrptedvoterId = bcrypt.hashSync(voterId,  10);

        //Create Stellar Transaction
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: requestedAdminData.walletAddress,
            asset: StellarSdk.Asset.native(), 
            amount: "0.00001", 
        }))
        .addMemo(StellarSdk.Memo.text(`Vote:${candidateId}`)) 
        .setTimeout(30)
        .build();

        //Sign Transaction
        const voterKeypair = StellarSdk.Keypair.fromSecret(requestedAdminData.walletSecret);
        transaction.sign(voterKeypair);
        const response = await server.submitTransaction(transaction);

        if (response.successful) {
            console.log("Vote Successfully Recorded on Stellar!");
            await Voter.findOneAndUpdate(
                { voterId },
                { $set: { voteCast: true } }, 
            );
            await logActivity(req, "cast_vote", "success", {transactionHash: response.hash});
            return res.status(200).json({ message: "Vote recorded!", Success:true ,  hash: response.hash });
        } else {
            console.log(`Transaction Failed: ${response.extras?.result_codes?.transaction}`);
            return res.status(400).json({Success:false  , error: response.extras?.result_codes?.transaction });
        }

    } catch (error) {
        console.error("Error in castVote:", error);
        return res.status(500).json({Success:false  , error: "Internal Server Error" });
    }
};

export const voter_login = async (req, res) => {
    try {
        const { voterId } = req.body;
        if (!voterId) {
            return res.status(400).json({ message: "Voter ID is required", Success: false });
        }
        const voter = await Voter.findOne({ voterId });
        if (!voter) {
            return res.status(404).json({ message: "Voter not found", Success: false });
        }
        res.status(200).json({ message: "Login successful", Success: true,  voter });    
    } catch (error) {
        console.error("Error in voter_login:", error);
        res.status(500).json({ message: "Internal Server Error", Success: false });
    }
}