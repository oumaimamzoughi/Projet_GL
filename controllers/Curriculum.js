const Curriculum = require('../models/Curriculum.model');

// Create a new curriculum
exports.createCurriculum = async (req, res) => {
  try {
    const newCurriculum = new Curriculum(req.body);
    await newCurriculum.save();
    res.status(201).json(newCurriculum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all curricula
exports.getAllCurricula = async (req, res) => {
  try {
    const curricula = await Curriculum.find();
    res.status(200).json(curricula);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific curriculum by ID
exports.getCurriculumById = async (req, res) => {
  try {
    const curriculum = await Curriculum.findById(req.params.id);
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.status(200).json(curriculum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a curriculum by ID
exports.updateCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.status(200).json(curriculum);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a curriculum by ID
exports.deleteCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndDelete(req.params.id);
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
