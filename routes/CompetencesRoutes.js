const express = require('express');
const router = express.Router();
const {
    createCompetence,
    getAllCompetences,
    getCompetenceById,
    updateCompetence,
    deleteCompetence,
} = require("../controllers/Competense")
// Create a new competence
router.post('/', createCompetence);

// Get all competences
router.get('/', getAllCompetences);

// Get a specific competence by ID
router.get('/:id', getCompetenceById);

// Update a competence by ID
router.put('/:id', updateCompetence);

// Delete a competence by ID
router.delete('/:id', deleteCompetence);

module.exports = router;
