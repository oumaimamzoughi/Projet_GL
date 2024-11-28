const PV = require('../models/PV.model');

// Create a new PV
exports.createPV = async (req, res) => {
  try {
    const newPV = new PV(req.body);
    await newPV.save();
    res.status(201).json(newPV);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all PVs
exports.getAllPVs = async (req, res) => {
  try {
    const pvs = await PV.find();
    res.status(200).json(pvs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific PV by ID
exports.getPVById = async (req, res) => {
  try {
    const pv = await PV.findById(req.params.id);
    if (!pv) {
      return res.status(404).json({ message: 'PV not found' });
    }
    res.status(200).json(pv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a PV by ID
exports.updatePV = async (req, res) => {
  try {
    const pv = await PV.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pv) {
      return res.status(404).json({ message: 'PV not found' });
    }
    res.status(200).json(pv);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a PV by ID
exports.deletePV = async (req, res) => {
  try {
    const pv = await PV.findByIdAndDelete(req.params.id);
    if (!pv) {
      return res.status(404).json({ message: 'PV not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
