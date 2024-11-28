const Defense = require('../models/Defense.model');

// Create a new defense
exports.createDefense = async (req, res) => {
  try {
    const newDefense = new Defense(req.body);
    await newDefense.save();
    res.status(201).json(newDefense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all defenses
exports.getAllDefenses = async (req, res) => {
  try {
    const defenses = await Defense.find();
    res.status(200).json(defenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific defense by ID
exports.getDefenseById = async (req, res) => {
  try {
    const defense = await Defense.findById(req.params.id);
    if (!defense) {
      return res.status(404).json({ message: 'Defense not found' });
    }
    res.status(200).json(defense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a defense by ID
exports.updateDefense = async (req, res) => {
  try {
    const defense = await Defense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!defense) {
      return res.status(404).json({ message: 'Defense not found' });
    }
    res.status(200).json(defense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a defense by ID
exports.deleteDefense = async (req, res) => {
  try {
    const defense = await Defense.findByIdAndDelete(req.params.id);
    if (!defense) {
      return res.status(404).json({ message: 'Defense not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
