const cron = require('node-cron');
const User = require('../models/User.model');
const { sendEmail } = require('./emailService');

const scheduleNotifications = () => {
  // Monthly notification to teachers
  cron.schedule('0 0 1 * *', async () => {
    const teachers = await User.find({ role: 'teacher' }).select('email');
    teachers.forEach(async (teacher) => {
      await sendEmail({
        to: teacher.email,
        subject: 'Monthly Reminder',
        text: 'This is your monthly notification from the system.',
      });
    });
    console.log('Monthly notifications sent to teachers');
  });

  // Weekly evaluation reminder to students
  cron.schedule('0 8 * * 1', async () => {
    const students = await User.find({ role: 'student' }).select('email');
    students.forEach(async (student) => {
      await sendEmail({
        to: student.email,
        subject: 'Subject Evaluation Reminder',
        text: 'Please evaluate your subjects. You can only evaluate each subject once.',
      });
    });
    console.log('Evaluation notifications sent to students');
  });
};

module.exports = { scheduleNotifications };