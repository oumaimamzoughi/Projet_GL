const Evaluation = require('../models/Evaluation.model');

// Create a new evaluation
exports.createEvaluation = async (req, res) => {
  try {
    const newEvaluation = new Evaluation(req.body);
    await newEvaluation.save();
    res.status(201).json(newEvaluation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all evaluations
exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific evaluation by ID
exports.getEvaluationById = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an evaluation by ID
exports.updateEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.status(200).json(evaluation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an evaluation by ID
exports.deleteEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
