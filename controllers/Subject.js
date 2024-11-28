const Subject = require('../models/Subject.model');

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
