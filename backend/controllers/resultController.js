import StellarSdk from "stellar-sdk";
import Candidate from "../models/Candidate.js";
import AdminData from "../models/Admin.js";
import "dotenv/config"
import axios from "axios";
import { Parser } from 'json2csv';
import moment from "moment";
import fs from 'fs';

const STELLAR_SERVER = process.env.STELLAR_SERVER; // Stellar Testnet link
const server = new StellarSdk.Server(STELLAR_SERVER);
export const getCandidateVotesbyadminforPublc = async (req, res) => {
    try {
        const { adminId } = req.query;

        if (!adminId) {
            return res.status(400).json({ error: "adminId is required in query parameters" });
        }

        const admin = await AdminData.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found!" });
        }

        if (admin.currentPhase === "Voting") {
            return res.status(200).json({
                message: "Voting is Ongoing...",
                success: false
            });
        }

        if (admin.currentPhase === "Registration") {
            return res.status(200).json({
                message: "Registration Phase is in Progress...",
                success: false
            });
        }

        const candidates = await Candidate.find({ admin: adminId });

        if (!candidates || candidates.length === 0) {
            return res.status(404).json({ error: "No Candidates Found for this admin!" });
        }

        if (!admin.walletAddress) {
            return res.status(404).json({ error: "Admin wallet not found!" });
        }

        // Fetch ALL transactions (pagination handled here)
        const getAllTransactions = async (walletAddress) => {
            let allTransactions = [];
            let page = await server.transactions()
                .forAccount(walletAddress)
                .limit(200)
                .order('desc')
                .call();

            while (true) {
                allTransactions = allTransactions.concat(page.records);

                if (!page.records || page.records.length < 200 || !page.next) {
                    break;
                }

                page = await page.next();
            }

            return allTransactions;
        };

        const transactions = await getAllTransactions(admin.walletAddress);

        let candidateVotesList = [];

        for (let candidate of candidates) {
            const { candidateId, name, party, location } = candidate;

            let voteCount = 0;

            transactions.forEach(tx => {
                if (tx.memo && tx.memo.includes("Vote:") && tx.memo.endsWith(`${candidateId}`)) {
                    voteCount++;
                }
            });

            candidateVotesList.push({
                candidateId,
                name,
                party,
                location,
                voteCount
            });
        }

        // Sort and extract top 5
        const top5Candidates = [...candidateVotesList]
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, 5);

        return res.status(200).json({
            top5Candidates,
            allCandidates: candidateVotesList
        });

    } catch (error) {
        console.error("Error :", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getCandidateVotesbyadmin = async (req, res) => {
    try {
        const adminId = req.admin._id;
        if (!adminId) {
            return res.status(400).json({ error: "adminId is required" });
        }

        const admin = await AdminData.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found!" });
        }

        if (admin.currentPhase === "Registration") {
            return res.status(200).json({
                message: "Registration Phase is in Progress...",
                success: false
            });
        }

        const candidates = await Candidate.find({ admin: adminId });
        if (!candidates || candidates.length === 0) {
            return res.status(404).json({ error: "No Candidates Found for this admin!" });
        }

        if (!admin.walletAddress) {
            return res.status(404).json({ error: "Admin wallet not found!" });
        }

        // Helper function to fetch all transactions using pagination
        const getAllTransactions = async (walletAddress) => {
            let allTransactions = [];
            let page = await server.transactions()
                .forAccount(walletAddress)
                .limit(200)
                .order('desc')
                .call();

            while (true) {
                allTransactions = allTransactions.concat(page.records);

                if (page.records.length < 200 || !page.next) {
                    break;
                }

                page = await page.next();
            }

            return allTransactions;
        };

        const transactions = await getAllTransactions(admin.walletAddress);

        let candidateVotesList = [];

        for (let candidate of candidates) {
            const { candidateId, name, party, location } = candidate;

            let voteCount = 0;
            transactions.forEach(tx => {
                if (tx.memo && tx.memo.includes("Vote:") && tx.memo.endsWith(`${candidateId}`)) {
                    voteCount++;
                }
            });

            candidateVotesList.push({
                candidateId,
                name,
                party,
                location,
                voteCount
            });
        }

        // Sort and extract top 5
        const top5Candidates = [...candidateVotesList]
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, 5);

        return res.status(200).json({
            top5Candidates,
            allCandidates: candidateVotesList
        });

    } catch (error) {
        console.error("Error :", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};




export const gethourlyVotesonblockchain = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const { filter } = req.query;

        if (!adminId) {
            return res.status(400).json({ error: "adminId is required" });
        }

        const admin = await AdminData.findById(adminId);
        if (!admin || !admin.walletAddress) {
            return res.status(404).json({ error: "Admin wallet not found!" });
        }

        // Date range logic
        let startDate = moment().startOf("day");
        let endDate = moment().endOf("day");

        switch (filter) {
            case "yesterday":
                startDate = moment().subtract(1, "day").startOf("day");
                endDate = moment().subtract(1, "day").endOf("day");
                break;
            case "last7days":
                startDate = moment().subtract(6, "days").startOf("day");
                endDate = moment().endOf("day");
                break;
            case "last30days":
                startDate = moment().subtract(29, "days").startOf("day");
                endDate = moment().endOf("day");
                break;
            case "today":
            default:
                startDate = moment().startOf("day");
                endDate = moment().endOf("day");
                break;
        }

        // Helper to fetch ALL paginated transactions
        const getAllTransactions = async (walletAddress) => {
            let allTransactions = [];
            let page = await server.transactions()
                .forAccount(walletAddress)
                .limit(200)
                .order("desc")
                .call();

            while (true) {
                allTransactions = allTransactions.concat(page.records);

                if (!page.records || page.records.length < 200 || !page.next) {
                    break;
                }

                page = await page.next();
            }

            return allTransactions;
        };

        const transactions = await getAllTransactions(admin.walletAddress);

        const hourlyVotes = Array(24).fill(0);

        transactions.forEach(tx => {
            if (tx.memo && tx.memo.includes("Vote:")) {
                const txTime = moment(tx.created_at);
                if (txTime.isBetween(startDate, endDate, null, '[]')) {
                    const hour = txTime.hour();
                    hourlyVotes[hour]++;
                }
            }
        });

        return res.status(200).json({ hourlyVotes });

    } catch (error) {
        console.error("Error in gethourlyVotesonblockchain:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const totalvotesofallcandidate = async (req, res) => {
    try {
        const adminId = req.admin._id;
        const admin = await AdminData.findById(adminId);

        if (!admin || !admin.walletAddress) {
            return res.status(404).json({ error: "Admin wallet address not found!" });
        }
        const adminAddress = admin.walletAddress;
        if (
            typeof adminAddress !== 'string' ||
            !adminAddress.startsWith('G') ||
            adminAddress.length !== 56
        ) {
            return res.status(400).json({ error: "Invalid wallet address!" });
        }
        try {
            await server.loadAccount(adminAddress);
        } catch (err) {
            return res.status(400).json({ error: "Admin wallet address is inactive or unfunded!" });
        }
        // Helper to fetch all paginated transactions
        const getAllTransactions = async (walletAddress) => {
            let allTransactions = [];
            let page = await server.transactions()
                .forAccount(walletAddress)
                .limit(200)
                .order("desc")
                .call();

            while (true) {
                allTransactions = allTransactions.concat(page.records);
                if (!page.records || page.records.length < 200 || !page.next) {
                    break;
                }
                page = await page.next();
            }
            return allTransactions;
        };
        const transactions = await getAllTransactions(adminAddress);
        let totalVotes = 0;
        transactions.forEach(tx => {
            if (tx.memo && tx.memo.includes("Vote:")) {
                totalVotes++;
            }
        });
        return res.status(200).json({
            totalVotes
        });
    } catch (error) {
        console.error("Error in totalvotesofallcandidate:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const downloadStellarCSV = async (req, res) => {
    try {
        const accountId = req.admin.walletAddress; // Use the admin's wallet address
        const horizonUrl = `https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`;

        const response = await axios.get(horizonUrl);
        const transactions = response.data._embedded.records;

        if (transactions.length === 0) {
            return res.status(404).json({ error: "No transactions found." });
        }

        const formattedTransactions = transactions.map(tx => ({
            'Tx Hash': tx.hash,
            'Source Account': tx.source_account,
            'Fee Charged': tx.fee_charged,
            'Created At': tx.created_at,
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(formattedTransactions);

        const filename = `stellar_transactions_${accountId.substring(0, 6)}.csv`;
        fs.writeFileSync(filename, csv);
        
        return res.status(200).download(filename, () => {
            fs.unlinkSync(filename); // Delete the file after sending it
        });

    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        return res.status(500).json({ error: 'Error fetching transactions.' });
    }

}