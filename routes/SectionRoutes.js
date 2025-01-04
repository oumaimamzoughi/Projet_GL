const express = require('express');
const router = express.Router();
const {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    deleteSection,
} = require("../controllers/Section")
// Create a new section
router.post('/', createSection);

// Get all sections
router.get('/', getAllSections);

// Get a specific section by ID
router.get('/:id', getSectionById);

// Update a section by ID
router.put('/:id', updateSection);

// Delete a section by ID
router.delete('/:id', deleteSection);

module.exports = router;