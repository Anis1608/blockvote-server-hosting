import { logActivity } from "../middleware/activityLogger.js";
import AdminData from "../models/Admin.js";
import candidateModel from "../models/Candidate.js";
import VoterModel from "../models/Voter.js";

// ✅ 1. Register Candidate (with admin)
export const RegisterCandidate = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const currentPhase = req.admin.currentPhase; // assuming you're using middleware to attach admin info to req
    const { candidateId, name, profilePic, age, qualification, location, party } = req.body;

    if (currentPhase !== "Registration") {
      return res.status(200).json({
        message: "Candidate Registration Phase is Closed...",
        success: false
      });
    }

    if (!candidateId || !name || !profilePic || !age || !qualification || !location || !party) {
      return res.status(400).json({ message: "Something is Missing..." });
    }

    const checkCandidate = await candidateModel.findOne({ candidateId });
    if (checkCandidate) {
      return res.status(400).json({
        message: "Candidate Already Registered...",
        success: false
      });
    }

    if (age < 18) {
      return res.status(400).json({
        message: "Candidate Age Should be Greater than 18...",
        success: false
      });
    }

    const candidateDetails = await candidateModel.create({
      candidateId,
      name,
      profilePic,
      age,
      qualification,
      location,
      party,
      admin: adminId
    });

    await logActivity(req, "Candidate Registration", "success", {name});

    res.status(200).json({
      message: "Candidate Registered Successfully...",
      success: true,
      candidateDetails
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something Went Wrong...",
      success: false
    });
  }
};

//  2. Get All Candidates
export const getAllCandidates = async (req, res) => {
  try {
    const adminId = req.admin._id; 
    const getDetails = await candidateModel.find({ admin: adminId });

    if (!getDetails || getDetails.length === 0) {
      return res.status(404).json({ message: "No Candidates Found for this Admin", success: false });
    }

    res.status(200).json({
      message: "All Candidates Registered by this Admin",
      success: true,
      candidates: getDetails
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something Went Wrong...",
      success: false
    });
  }
};



export const getCandidateforPublic = async (req, res) => {
  try {
    const { adminId } = req.query; 
    const candidates = await candidateModel.find({ admin: adminId });

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: "No Candidates Found for this Admin", success: false });
    }
    res.status(200).json({
      success: true,
      candidates: candidates.map(c => ({
        name: c.name,
        party: c.party,
        age: c.age,
        qualification: c.qualification,
        location: c.location,
        profile: c.profilePic,    
      }))
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates'
    });
  }
};




// 3. Get Candidates from Same City as Voter
export const SameCityCandidate = async (req, res) => {
  try {
    const { voterId } = req.body;
    if (!voterId) {
      return res.status(400).json({ message: "Voter ID is required", success: false });
    }
    const voter = await VoterModel.findOne({ voterId });
    if (!voter) {
      return res.status(404).json({ message: "Voter not found", success: false });
    }

    const candidates = await candidateModel.find({
      "location.city": voter.location.city
    });

    if (candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found in your area", success: false });
    }

    res.status(200).json({
      message: "Candidates from your City & State",
      success: true,
      candidates
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", success: false });
  }
};

// // ✅ 4. Get Total Candidate Count (All)
// export const totalnoCandidate = async (req, res) => {
//   try {
//     const totalCandidateCount = await candidateModel.countDocuments();

//     if (totalCandidateCount === 0) {
//       return res.status(404).json({
//         message: "No Candidates Found.",
//         success: false,
//         totalCandidates: 0
//       });
//     }

//     res.status(200).json({
//       message: "Total Candidates Count Fetched.",
//       success: true,
//       totalCandidates: totalCandidateCount
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Something Went Wrong...",
//       success: false
//     });
//   }
// };

// . Get Total Candidates Registered by Admin
export const totalnoCandidate = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const totalCandidateCount = await candidateModel.countDocuments({ admin: adminId });

    res.status(200).json({
      message: "Total Candidates by Admin Count Fetched.",
      success: true,
      totalCandidates: totalCandidateCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something Went Wrong...",
      success: false
    });
  }
};
