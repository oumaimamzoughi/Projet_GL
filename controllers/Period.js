const Period = require('../models/Period.model');
const Period_Validator = require('../validator/Period_Validator.js');

// Create a new period
exports.createPeriod = async (req, res) => {
  try {
   
    const validatedData = await Period_Validator.validateAsync(req.body);
    const newPeriod = new Period(validatedData);
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
    const period = await Period.findOne({ _id: req.params.id });
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
    const period = await Period.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.status(200).json({
      model: task,
      message: "Object modifié",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// Delete a period by ID
exports.deletePeriod = async (req, res) => {
  try {
    const period = await Period.findOneAndDelete({ _id: req.params.id });
    if (!period) {
      return res.status(404).json({ message: 'Period not found' });
    }
    res.status(200).send({
      message: "Object supprimé",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
