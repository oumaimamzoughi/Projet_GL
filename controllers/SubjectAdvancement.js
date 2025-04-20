// controllers/SubjectAdvancementController.js
const SubjectAdvancementService = require('../services/SubjectAdvancementService');

exports.updateSubjectAdvancement = async (req, res) => {
  try {
    const { teacherId, subjectId, advancement } = req.body;

    const updatedSubject = await SubjectAdvancementService.updateSubjectAdvancement(
      teacherId,
      subjectId,
      advancement
    );

    res.status(200).json({
      message: 'Advancement updated successfully, notifications sent to admin and students',
      subject: updatedSubject,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};