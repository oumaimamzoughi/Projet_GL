const cron = require('node-cron');
const sendEmail = require('../services/emailService');
const User = require('../models/User.model');
const Internship = require('../models/Internship.model');
const Period = require('../models/Period.model');


const notifyRetardCronJob = async () => {
  try {
    
    console.log("hello world");
    
    const currentDate = new Date();
    const openPeriods = await Period.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    if (openPeriods.length === 0) {
      console.log('No open periods. Skipping email reminders.');
      return;
    }


    const students = await User.find({ role: 'student' });

    for (const student of students) {
      let hasSubmitted = false;

      for (const period of openPeriods) {
        const submission = await Internship.findOne({
          studentId: student._id,
          type: period.type,
        });

        if (submission) {
          hasSubmitted = true;
          break; 
        }
      }

      
      if (!hasSubmitted) {
        const emailSubject = 'Reminder: Internship Submission Deadline';
        const emailMessage = `
          <p>Dear ${student.firstName},</p>
          <p>This is a reminder to submit your internship for the current period before the deadline.</p>
          <p>Best regards,<br>Your University Administration</p>
        `;

        await sendEmail({
          to: student.email,
          subject: emailSubject,
          html: emailMessage,
        });

        console.log(`Reminder email sent to ${student.email}`);
      }
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
};

// Schedule the Cron Job to run daily at 8 AM
//cron.schedule('* * * * *', notifyRetardCronJob);

module.exports = notifyRetardCronJob;
