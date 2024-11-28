const Competence = require('../models/Competence.model');

// Create a new competence
exports.createCompetence = async (req, res) => {
  try {
    const newCompetence = new Competence(req.body);
    await newCompetence.save();
    res.status(201).json(newCompetence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all competences
exports.getAllCompetences = async (req, res) => {
  try {
    const competences = await Competence.find();
    res.status(200).json(competences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific competence by ID
exports.getCompetenceById = async (req, res) => {
  try {
    const competence = await Competence.findById(req.params.id);
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(200).json(competence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a competence by ID
exports.updateCompetence = async (req, res) => {
  try {
    const competence = await Competence.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(200).json(competence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a competence by ID
exports.deleteCompetence = async (req, res) => {
  try {
    const competence = await Competence.findByIdAndDelete(req.params.id);
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
