const Evaluation = require('../models/Evaluation.model');
const Subject = require('../models/Subject.model');
const User = require('../models/User.model');
const { sendEmail } = require('../services/emailService'); // Utilitaire d'envoi d'email

// Envoyer un rappel d'évaluation à tous les étudiants
exports.evaluationReminder = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('subjects');

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'Aucun étudiant trouvé' });
    }

    for (const student of students) {
      await sendEmail({
        to: student.email,
        subject: 'Rappel d\'évaluation à venir',
        text: `Bonjour ${student.name},\n\nCeci est un rappel concernant vos évaluations à venir.`,
        html: `<p>Bonjour ${student.name},</p><p>Ceci est un rappel concernant vos évaluations à venir.</p>`,
      });

      console.log(`Rappel d'évaluation envoyé à : ${student.email}`);
    }

    res.status(200).json({ message: 'Rappel d\'évaluation envoyé à tous les étudiants.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rappel d\'évaluation :', error);
    res.status(500).json({ error: error.message });
  }
};

exports.submitEvaluation = async (req, res) => {
  const { studentId, subjectId, message } = req.body;

  try {
    // Check if the student has already evaluated this subject
    const alreadyEvaluated = await Evaluation.findOne({ subject: subjectId, 'meta.studentId': studentId });
    if (alreadyEvaluated) {
      return res.status(400).json({ error: 'You have already submitted an evaluation for this subject.' });
    }

    // Find the subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Find teachers who are assigned to the subject by looking for users with 'teacher' role
    const teachers = await User.find({ role: 'teacher', subjects: subjectId });

    // If no teachers are found, set teachers as an empty array
    const teacherIds = teachers.length > 0 ? teachers.map(teacher => teacher._id) : [];

    // Create the evaluation with the teacher IDs (empty array if no teachers found)
    const evaluation = new Evaluation({
      id_sender: studentId,
      subjectId: subjectId,
      teachers: teacherIds,  // Save empty array if no teachers
      message,
    });

    // Save the evaluation
    await evaluation.save();

    res.status(201).json({ message: 'Evaluation submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAnonymousEvaluations = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const evaluations = await Evaluation.find({ subjectId: subjectId }).select('message createdAt');
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find().select('message createdAt');
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};