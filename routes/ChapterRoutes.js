const express = require('express');
const router = express.Router();
const {
    createChapter,
    getAllChapters,
    getChapterById,
    updateChapter,
    deleteChapter,
} = require("../controllers/Chapter")
// Create a new chapter
router.post('/', createChapter);

// Get all chapters
router.get('/', getAllChapters);

// Get a specific chapter by ID
router.get('/:id', getChapterById);

// Update a chapter by ID
router.put('/:id', updateChapter);

// Delete a chapter by ID
router.delete('/:id', deleteChapter);

module.exports = router;