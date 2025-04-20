// routes/SubjectAdvancementRouter.js

const express = require('express');
const router = express.Router();

// Correction du nom du fichier contrôleur
const {
  updateSubjectAdvancement,
} = require('../controllers/SubjectAdvancement');

// Route pour mettre à jour l’avancement d’un enseignant pour une matière
router.put('/', updateSubjectAdvancement);

module.exports = router;
