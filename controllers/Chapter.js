const Chapter = require('../models/Chapter.model');

// Create a new chapter
exports.createChapter = async (req, res) => {
  try {
    const newChapter = new Chapter(req.body);
    await newChapter.save();
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all chapters
exports.getAllChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find();
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific chapter by ID
exports.getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a chapter by ID
exports.updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a chapter by ID
exports.deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
