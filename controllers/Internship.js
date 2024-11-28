const Internship = require('../models/Internship.model');

// Create a new internship
exports.createInternship = async (req, res) => {
  try {
    const newInternship = new Internship(req.body);
    await newInternship.save();
    res.status(201).json(newInternship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all internships
exports.getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find();
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific internship by ID
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an internship by ID
exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an internship by ID
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
