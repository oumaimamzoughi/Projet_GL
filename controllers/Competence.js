const Competence = require('../models/Competence.model');
const Subject = require('../models/Subject.model');
const User = require('../models/User.model')
const { sendNotification } = require('../services/notificationService')
// Create a new competence
exports.createCompetence = async (req, res) => {
  try {
    const newCompetence = new Competence(req.body);
    await newCompetence.save();
    console.log(newCompetence)
    res.status(201).json(newCompetence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all competences
exports.getAllCompetences = async (req, res) => {
  try {
    const competences = await Competence.find();
    res.status(200).json(competences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific competence by ID
exports.getCompetenceById = async (req, res) => {
  try {
    const competence = await Competence.findById(req.params.id);
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(200).json(competence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a competence by ID
exports.updateCompetence = async (req, res) => {
  try {
    const competence = await Competence.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!competence) {
      return res.status(404).json({ message: 'Competence not found' });
    }
    res.status(200).json(competence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCompetence = async (req, res) => {
  try {
    const competence = await Competence.findById(req.params.id);
    if (!competence) {
      return res.status(404).json({ message: 'Compétence introuvable' });
    }

    const isCompetenceInSubject = await Subject.exists({ competences: competence._id });

    if (isCompetenceInSubject) {
      // Fetch all admins
      const admins = await User.find({ role: 'admin' });

      // Notification details for restriction alert
      const notificationDetails = {
        title: 'Suppression non autorisée',
        message: `La compétence "${competence.name}" ne peut pas être supprimée car elle est utilisée dans un ou plusieurs sujets.`,
      };

      // Notify all admins about the restriction
      for (const admin of admins) {
        await sendNotification(admin._id, notificationDetails);

        await sendEmail({
          to: admin.email,
          subject: notificationDetails.title,
          text: notificationDetails.message,
          html: `<p>${notificationDetails.message}</p>`,
        });
      }

      return res.status(400).json({
        message: 'La compétence est utilisée dans un ou plusieurs sujets et ne peut pas être supprimée.',
      });
    }

    // Proceed to delete the competence if it is not used in any subject
    await Competence.findByIdAndDelete(req.params.id);

    // Notify admins about successful deletion
    const admins = await User.find({ role: 'admin' });

    const notificationDetails = {
      title: 'Compétence supprimée',
      message: `La compétence "${competence.name}" a été supprimée.`,
    };

    // for (const admin of admins) {
    //   await sendNotification(admin._id, notificationDetails);

    //   await sendEmail({
    //     to: admin.email,
    //     subject: notificationDetails.title,
    //     text: notificationDetails.message,
    //     html: `<p>${notificationDetails.message}</p>`,
    //   });
    // }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


