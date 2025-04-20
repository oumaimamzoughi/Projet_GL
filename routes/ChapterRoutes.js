const express = require('express');
const router = express.Router();
const ChapterController = require('../controllers/Chapter');

router.post('/', ChapterController.createChapter);
router.get('/:id', ChapterController.getChapter);
router.put('/:id', ChapterController.updateChapter);
router.delete('/:id', ChapterController.deleteChapter);
router.patch('/:id/status', ChapterController.updateStatus);

module.exports = router;