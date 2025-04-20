const express = require('express');
const router = express.Router();
const CompetenceController = require('../controllers/Competence');

router.post('/', CompetenceController.createCompetence);
router.get('/', CompetenceController.getAllCompetences);
router.get('/:id', CompetenceController.getCompetence);
router.put('/:id', CompetenceController.updateCompetence);
router.delete('/:id', CompetenceController.deleteCompetence);

module.exports = router;