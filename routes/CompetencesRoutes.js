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
router.post('/competence', createCompetence);

// Get all competences
router.get('/competences/', getAllCompetences);

// Get a specific competence by ID
router.get('/competences/:id', getCompetenceById);

// Update a competence by ID
router.put('/competences/:id', updateCompetence);

// Delete a competence by ID
router.delete('/competences/:id', deleteCompetence);

module.exports = router;
