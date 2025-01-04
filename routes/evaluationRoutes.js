const express = require('express');
const evaluationController = require('../controllers/Evaluation');

const router = express.Router();

router.post('/submit', evaluationController.submitEvaluation);
router.get('/', evaluationController.getAllEvaluations);
router.get('/anonymous/:subjectId', evaluationController.getAnonymousEvaluations);
router.post('/evaluation-reminder', evaluationController.evaluationReminder);

module.exports = router;