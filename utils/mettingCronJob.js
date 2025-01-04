
const cron = require('node-cron');
const sendEmail = require('../services/emailService');
const User = require('../models/User.model');
const Internship = require('../models/Internship.model');



const mettingCronJob = async () => {
  try {
    
    const currentDate = new Date();
    const twoDaysBefore = new Date(currentDate);
    twoDaysBefore.setDate(currentDate.getDate() + 2); // Two days ahead

    const twoDaysAfter = new Date(twoDaysBefore); // Get the range for the next day
    twoDaysAfter.setDate(twoDaysBefore.getDate() + 1);

    // Get all internships with a scheduled meeting in the next two days
    const internships = await Internship.find({
      'schedule.date': {
        $gte: twoDaysBefore, // Date is greater than or equal to two days before
        $lt: twoDaysAfter,   // Date is less than the next day
      },
    });

    for (const internship of internships) {
      const student = await User.findById(internship.studentId);

      // Construct the email content
      const emailSubject = 'Upcoming Meeting Reminder';
      const emailMessage = `
        <p>Dear ${student.firstName},</p>
        <p>This is a reminder that you have an upcoming meeting scheduled on ${internship.schedule.date.toLocaleDateString()} at ${internship.schedule.time}.</p>
        <p>Meeting Link: ${internship.schedule.googleMeetLink || 'No Google Meet link provided.'}</p>
        <p>Best regards,<br>Your University Administration</p>
      `;

      // Send the email
      await sendEmail({
        to: student.email,
        subject: emailSubject,
        html: emailMessage,
      });

      console.log(`Meeting reminder email sent to ${student.email}`);
    }
  } catch (error) {
    console.error('Error sending meeting reminders:', error);
  }
};

// Schedule the Cron Job to run daily at nos lil 

//cron.schedule('* * * * *', mettingCronJob);

module.exports = mettingCronJob;
