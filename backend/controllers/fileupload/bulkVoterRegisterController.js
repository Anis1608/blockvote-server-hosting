import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import csvParser from 'csv-parser';
import VoterData from '../../models/Voter.js';
import { logActivity } from '../../middleware/activityLogger.js';
import emailQueue from '../../Utils/emailQueue.js';

// Helper function to validate and format date
const formatDate = (dobRaw) => {
  const dateMatch = dobRaw.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dateMatch) {
    const [_, dd, mm, yyyy] = dateMatch;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return null;
};

// Helper function to clean up file
// const cleanupFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//     fs.unlink(filePath, (err) => {
//       if (err) console.error('Error deleting file:', err);
//     });
//   }
// };

export const bulkRegisterVoters = async (req, res) => {
  const startTime = Date.now();
  let filePath;

  try {
    // Phase validation
    const currentPhase = req.admin.currentPhase;
    if (currentPhase !== 'Registration') {
      return res.status(400).json({
        message: 'Voter registration is currently closed',
        success: false,
      });
    }

    // File validation
    const file = req.file;
    if (!file) {
      return res.status(400).json({ 
        message: 'No file uploaded', 
        success: false 
      });
    }

    // Get email preference from request body
    const sendEmails = req.body.sendEmails === 'yes';
    
    filePath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();
    const adminId = req.admin._id;

    if (!['.csv', '.xlsx'].includes(ext)) {
      cleanupFile(filePath);
      return res.status(400).json({ 
        message: 'Only CSV and Excel files are allowed', 
        success: false 
      });
    }

    // Process file
    const voters = [];
    const errors = [];
    let rowCount = 0;

    const processRow = (row, index) => {
      rowCount++;
      try {
        const voterId = row.voterId?.toString().trim();
        const email = row.email?.toString().trim().toLowerCase();
        const name = row.name?.toString().trim();
        const dobRaw = row.dob?.toString().trim();
        const city = row.city?.toString().trim();
        const state = row.state?.toString().trim();

        // Validate required fields
        if (!voterId || !email || !name || !dobRaw || !city || !state) {
          errors.push({
            row: index + 2,
            error: 'Missing required fields',
            data: row
          });
          return;
        }

        // Validate and format date
        const dob = formatDate(dobRaw);
        if (!dob) {
          errors.push({
            row: index + 2,
            error: 'Invalid date format (use DD-MM-YYYY or DD/MM/YYYY)',
            data: row
          });
          return;
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({
            row: index + 2,
            error: 'Invalid email format',
            data: row
          });
          return;
        }

        voters.push({
          voterId,
          name,
          dob,
          email,
          location: { state, city },
          admin: adminId,
          registrationDate: new Date()
        });
      } catch (error) {
        errors.push({
          row: index + 2,
          error: 'Processing error',
          details: error.message,
          data: row
        });
      }
    };

    // File processing
    if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (row) => processRow(row, rowCount))
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      data.forEach((row, index) => processRow(row, index));
    }

    const results = [];
    const skipped = [];
    const emailJobs = [];

    for (const voter of voters) {
      try {
        const existingVoter = await VoterData.findOne({
          admin: adminId,
          $or: [{ voterId: voter.voterId }, { email: voter.email }]
        });
      
        if (existingVoter) {
          skipped.push({
            voterId: voter.voterId,
            email: voter.email,
            reason: existingVoter.voterId === voter.voterId ? 
                   'Voter ID already exists' : 'Email already registered'
          });
          continue;
      }
        const dob = formatDate(voter.dob);
        const currentDate = new Date();
        const age = currentDate.getFullYear() - new Date(dob).getFullYear();
        const monthDiff = currentDate.getMonth() - new Date(dob).getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < new Date(dob).getDate())) {
          voter.age = age - 1; // Adjust age if birthday hasn't occurred yet this year
        } else {
          voter.age = age; // Set age directly
        }
        if (voter.age < 18) {
          skipped.push({
            voterId: voter.voterId,
            email: voter.email,
            reason: 'Voter is under 18 years old'
          });
          continue;
        }
        const newVoter = await VoterData.create(voter);
        results.push(newVoter);
        // Only add email job if sendEmails is true
        if (sendEmails) {
          const job = await emailQueue.add(
            { voter: newVoter.toObject() },
            { 
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
              timeout: 10000,
              removeOnComplete: true,
              removeOnFail: 100
            }
          );
          emailJobs.push(job.id);
        }
      } catch (error) {
        console.error(`Error processing voter ${voter.voterId}:`, error);
        errors.push({
          voterId: voter.voterId,
          error: 'Database error',
          details: error.message
        });
      }
    }

    // Log activity
    await logActivity(req, 'bulk_voter_registration', 'success', {
      totalUploaded: results.length,
      totalSkipped: skipped.length,
      emailsSent: sendEmails ? emailJobs.length : 0
    });

    // Clean up file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted:", filePath);
      }
    });

    // Response
    return res.status(200).json({
      message: sendEmails 
        ? 'Voter Registration Completed... Voter will Receive VoterID Their Respective Email Shortly'
        : 'Voter Registration Completed Successfully',
      Success: true,
      stats: {
        totalRows: rowCount,
        registered: results.length,
        skipped: skipped.length,
        emailsSent: sendEmails ? emailJobs.length : 0,
        processingTime: `${(Date.now() - startTime) / 1000} seconds`,
      },
      details: {
        registeredVoters: results.map(v => v.voterId),
        skippedVoters: skipped,
      }
    });

  } catch (error) {
    console.error('Bulk registration error:', error);

    if (filePath) cleanupFile(filePath);

    return res.status(500).json({
      message: 'Internal server error during bulk registration',
      success: false,
      error: process.env.NODE_ENV === 'development' ? 
        error.message : 'Please contact support'
    });
  }
};