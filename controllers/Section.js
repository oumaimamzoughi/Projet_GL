const Section = require('../models/Section.model');

// Create a new section
exports.createSection = async (req, res) => {
  try {
    const newSection = new Section(req.body);
    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all sections
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find();
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a section by ID
exports.updateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.status(200).json(section);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a section by ID
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
