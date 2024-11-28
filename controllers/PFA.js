const PFA = require('../models/PFA.model');

// Create a new PFA
exports.createPFA = async (req, res) => {
  try {
    const newPFA = new PFA(req.body);
    await newPFA.save();
    res.status(201).json(newPFA);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all PFAs
exports.getAllPFAs = async (req, res) => {
  try {
    const pfas = await PFA.find();
    res.status(200).json(pfas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific PFA by ID
exports.getPFAById = async (req, res) => {
  try {
    const pfa = await PFA.findById(req.params.id);
    if (!pfa) {
      return res.status(404).json({ message: 'PFA not found' });
    }
    res.status(200).json(pfa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a PFA by ID
exports.updatePFA = async (req, res) => {
  try {
    const pfa = await PFA.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pfa) {
      return res.status(404).json({ message: 'PFA not found' });
    }
    res.status(200).json(pfa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a PFA by ID
exports.deletePFA = async (req, res) => {
  try {
    const pfa = await PFA.findByIdAndDelete(req.params.id);
    if (!pfa) {
      return res.status(404).json({ message: 'PFA not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
