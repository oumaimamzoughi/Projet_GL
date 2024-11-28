const Period = require('../models/Period.model');

// Create a new period
exports.createPeriod = async (req, res) => {
  try {
    const newPeriod = new Period(req.body);
    await newPeriod.save();
    res.status(201).json(newPeriod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all periods
exports.getAllPeriods = async (req, res) => {
  try {
    const periods = await Period.find();
    res.status(200).json(periods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific period by ID
exports.getPeriodById = async (req, res) => {
  try {
    const period = await Period.findOne({ period_id: req.params.id });
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.status(200).json(period);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a period by ID
exports.updatePeriod = async (req, res) => {
  try {
    const period = await Period.findOneAndUpdate({ period_id: req.params.id }, req.body, { new: true });
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.status(200).json(period);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a period by ID
exports.deletePeriod = async (req, res) => {
  try {
    const period = await Period.findOneAndDelete({ period_id: req.params.id });
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
