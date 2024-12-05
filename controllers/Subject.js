const Subject = require('../models/Subject.model');
const Teacher = require('../models/Teacher.model');
const Student = require('../models/Student.model');
// Create a new subject
exports.createSubject = async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject by ID
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hide or unhide a subject by ID
exports.toggleSubjectVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { masked } = req.body;

    if (typeof masked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for masked. It must be a boolean.' });
    }

    const subject = await Subject.findByIdAndUpdate(id, { masked }, { new: true });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId).populate('subjects');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json(teacher.subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubjectsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Find the student and populate their subjects
    const student = await Student.findById(studentId).populate('subjects');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student.subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};