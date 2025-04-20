// services/SubjectAdvancementService.js
const User = require('../models/User.model');
const Subject = require('../models/Subject.model');
const { sendNotification } = require('./notificationService');
const { sendEmail } = require('./emailService');

class SubjectAdvancementService {
  static async updateSubjectAdvancement(teacherId, subjectId, advancement) {
    // Find the teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Teacher not found');
    }

    // Check if the teacher is assigned to the subject
    const isAssigned = teacher.subjects.some(subject => subject.toString() === subjectId);
    if (!isAssigned) {
      throw new Error('Subject not found for the teacher');
    }

    // Find the subject in the database
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new Error('Subject not found in the database');
    }

    // Update the advancement field
    subject.advancement = advancement;
    await subject.save();

    // Notify admin and students in the same class
    const notificationDetails = {
      title: 'Subject Advancement Updated',
      message: `The advancement for the subject "${subject.title}" has been updated to: ${advancement}`,
    };

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await sendNotification(admin._id, notificationDetails);
      await sendEmail({
        to: admin.email,
        subject: notificationDetails.title,
        text: notificationDetails.message,
        html: `<p>${notificationDetails.message}</p>`,
      });
    }

    // Notify students in the same class as the teacher
    const studentsInSameClass = await User.find({
      class: teacher.class,
      role: 'student',
    });

    for (const student of studentsInSameClass) {
      await sendNotification(student._id, notificationDetails);
      await sendEmail({
        to: student.email,
        subject: notificationDetails.title,
        text: notificationDetails.message,
        html: `<p>${notificationDetails.message}</p>`,
      });
    }

    return subject;
  }
}

module.exports = SubjectAdvancementService;