const SubjectChoice = require('../models/SubjectChoice.model');

// Create a new subject choice
exports.createSubjectChoice = async (req, res) => {
  try {
    const newSubjectChoice = new SubjectChoice(req.body);
    await newSubjectChoice.save();
    res.status(201).json(newSubjectChoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all subject choices
exports.getAllSubjectChoices = async (req, res) => {
  try {
    const subjectChoices = await SubjectChoice.find();
    res.status(200).json(subjectChoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific subject choice by name
exports.getSubjectChoiceByName = async (req, res) => {
  try {
    const subjectChoice = await SubjectChoice.findOne({ subject_name: req.params.name });
    if (!subjectChoice) {
      return res.status(404).json({ message: 'Subject choice not found' });
    }
    res.status(200).json(subjectChoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject choice by name
exports.updateSubjectChoice = async (req, res) => {
  try {
    const subjectChoice = await SubjectChoice.findOneAndUpdate({ subject_name: req.params.name }, req.body, { new: true });
    if (!subjectChoice) {
      return res.status(404).json({ message: 'Subject choice not found' });
    }
    res.status(200).json(subjectChoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject choice by name
exports.deleteSubjectChoice = async (req, res) => {
  try {
    const subjectChoice = await SubjectChoice.findOneAndDelete({ subject_name: req.params.name });
    if (!subjectChoice) {
      return res.status(404).json({ message: 'Subject choice not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
