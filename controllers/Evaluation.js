const Evaluation = require('../models/Evaluation.model');
const Subject = require('../models/Subject.model');

exports.submitEvaluation = async (req, res) => {
  const { studentId, subjectId, message } = req.body;

  try {
    const alreadyEvaluated = await Evaluation.findOne({ subject: subjectId, 'meta.studentId': studentId });
    if (alreadyEvaluated) {
      return res.status(400).json({ error: 'You have already submitted an evaluation for this subject.' });
    }

    const subject = await Subject.findById(subjectId).populate('teacher');
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    const evaluation = new Evaluation({
      subject: subjectId,
      teacher: subject.teacher._id,
      message,
    });

    await evaluation.save();
    res.status(201).json({ message: 'Evaluation submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnonymousEvaluations = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const evaluations = await Evaluation.find({ subject: subjectId }).select('message createdAt');
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
