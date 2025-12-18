import Bull from 'bull';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: "anis1098imcc@gmail.com", 
    pass: "ipcd ewkx gdfh irxy"   
  }
});

// Create queue
const emailQueue = new Bull('voter-email-queue', {
  redis: {
    host: "redis-13772.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 13772,
    username: 'default',
    password: "Aniskhan1608@",
  },
  limiter: {
    max: 12, // Max jobs per second
    duration: 60000,
  },
});

// Process jobs from the queue
emailQueue.process(2, async (job) => { 
  const { voter } = job.data;
  
  try {
    const mailOptions = {
      from: `"Voter Registration"`,
      to: voter.email,
      subject: 'Your Voter Registration Confirmation',
      html: `
       <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <!-- Header with BlockVote Logo -->
  <div style="background: linear-gradient(135deg, #4a6bff, #6a11cb); padding: 25px; text-align: center;">
    <img src="https://blockvote.example.com/logo.png" alt="BlockVote Logo" style="height: 50px; margin-bottom: 15px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Voter Registration Confirmed</h1>
  </div>
  
  <!-- Content Area -->
  <div style="padding: 25px; background: #ffffff;">
    <p style="font-size: 16px; color: #555; line-height: 1.6;">Dear ${voter.name},</p>
    <p style="font-size: 16px; color: #555; line-height: 1.6;">Congratulations! Your registration with <strong>BlockVote</strong> has been successfully processed.</p>
    
    <!-- Voter ID Card -->
    <div style="background: linear-gradient(to right, #f8f9fa, #e9ecef); 
                padding: 20px; 
                border-radius: 8px; 
                margin: 25px 0;
                border-left: 4px solid #4a6bff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color: #4a6bff; margin-top: 0;">Your Voter Credentials</h3>
      <table style="width: 100%;">
        <tr>
          <td style="width: 30%; color: #777;">Voter ID:</td>
          <td style="font-weight: bold;">${voter.voterId}</td>
        </tr>
        <tr>
          <td style="color: #777;">Registered On:</td>
          <td>${new Date().toLocaleDateString()}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; color: #555; line-height: 1.6;">
      Please keep this information secure as it will be required for voting in upcoming elections.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://blockvote.example.com/dashboard" 
         style="display: inline-block; 
                background: #4a6bff; 
                color: white; 
                padding: 12px 25px; 
                text-decoration: none; 
                border-radius: 4px; 
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(74, 107, 255, 0.3);">
        Go to Voter Dashboard
      </a>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #777; border-top: 1px solid #e0e0e0;">
    <p style="margin: 0 0 10px 0;">
      <a href="https://blockvote.site" style="color: #4a6bff; text-decoration: none;">BlockVote</a> | 
      <a href="https://blockvote.site" style="color: #4a6bff; text-decoration: none;">Help Center</a> | 
      <a href="https://blockvote.site" style="color: #4a6bff; text-decoration: none;">Contact Us</a>
    </p>
    <p style="margin: 0; font-size: 12px;">
      If you didn't request this registration, please <a href="mailto:support@blockvote.example.com" style="color: #4a6bff;">contact our support team</a> immediately.
    </p>
  </div>
</div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${voter.email}`);
    return { success: true, email: voter.email };
  } catch (error) {
    console.error(`Failed to send email to ${voter.email}:`, error);
    throw error; 
  }
});

emailQueue.on('completed', (job, result) => {
  console.log(`Email job completed for ${result.email}`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job failed for ${job.data.voter.email}:`, err);
});

emailQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

export default emailQueue;