const User = require('../models/User.model');
const Subject = require('../models/Subject.model');
const  sendEmail  = require('../services/emailService'); // Assuming these utility functions exist
const { sendNotification } = require('../services/notificationService')
exports.createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, ...updateData } = req.body;

    if (role) {
      return res.status(400).json({ error: 'Role update is not allowed' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const users = await User.find({ role });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubjectAdvancement = async (req, res) => {
  try {
    const { teacherId, subjectId, advancement } = req.body;

    // Find the teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if the teacher is assigned to the subject
    const subject = teacher.subjects.find(subject => subject.toString() === subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found for the teacher' });
    }

    // Find the subject in the database
    const subjectToUpdate = await Subject.findById(subjectId);
    if (!subjectToUpdate) {
      return res.status(404).json({ message: 'Subject not found in the database' });
    }

    // Update the advancement field
    subjectToUpdate.advancement = advancement;
    await subjectToUpdate.save();

    // Notify admin and students in the same class
    const notificationDetails = {
      title: 'Subject Advancement Updated',
      message: `The advancement for the subject "${subjectToUpdate.title}" has been updated to: ${advancement}`,
    };

    // Notify the admin
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

    res.status(200).json({
      message: 'Advancement updated successfully, notifications sent to admin and students',
      subject: subjectToUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
