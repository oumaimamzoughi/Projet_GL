const Defense = require('../models/Defense.model');
const PFA = require('../models/PFA.mode');
const User = require('../models/User.model');
const { sendEmail } = require("../services/emailService");
const mongoose = require("mongoose");
const Mail = require("../models/email.model");
const ScheduleDefenseService = require("../services/ScheduleDefenseService");


exports.createDefenses = async (req, res) => {
  try {
    const { dates, rooms, startTime, endTime } = req.body;
    if (!dates || !rooms || !startTime || !endTime) {
      return res.status(400).json({ message: "Données manquantes." });
    }

    const defenses = await ScheduleDefenseService.scheduleDefenses(
      dates,
      rooms,
      startTime,
      endTime
    );

    res.status(200).json({
      message: "Soutenances créées avec succès.",
      defenses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Consulter les soutenances
exports.getAllDefenses = async (req, res) => {
  try {
    // Récupérer toutes les soutenances
    const defenses = await Defense.find()
      .populate('pfa', 'title student') 
      .populate('teacher', 'firstName lastName') 
      .populate('rapporteur', 'firstName lastName') 
      .exec();

    // Vérifier si des soutenances existent
    if (!defenses.length) {
      return res.status(404).json({ message: 'Aucune soutenance trouvée' });
    }

    // Retourner les soutenances
    return res.status(200).json({
      message: 'Liste des soutenances récupérée avec succès',
      defenses,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des soutenances:', error);
    return res.status(500).json({
      message: 'Erreur lors de la récupération des soutenances',
      error: error.message,
    });
  }
};

//Update defense
exports.updateDefense = async (req, res) => {
  try {
    const { defenseId } = req.params;
    const { rapporteur, room, date, time } = req.body;

    // Vérification que l'identifiant de la soutenance est fourni
    if (!defenseId) {
      return res.status(400).json({ message: "L'ID de la soutenance est requis." });
    }

    // Trouver la soutenance existante
    const defense = await Defense.findById(defenseId);
    if (!defense) {
      return res.status(404).json({ message: "Soutenance introuvable." });
    }

    // Mise à jour des champs avec validation
    if (rapporteur) defense.rapporteur = rapporteur;
    if (room) defense.room = room;
    if (date) defense.date = date;
    if (time) defense.time = time;

    // Vérification des conflits de salles et d'horaires
    const overlappingDefense = await Defense.findOne({
      _id: { $ne: defenseId }, // Exclure la soutenance en cours de modification
      date: defense.date,
      room: defense.room,
      time: defense.time,
    });

    if (overlappingDefense) {
      return res.status(400).json({
        message: "Conflit détecté : une autre soutenance est déjà planifiée pour cette salle et cet horaire.",
      });
    }

    // Sauvegarder les modifications
    await defense.save();

    return res.status(200).json({
      message: "Soutenance modifiée avec succès.",
      defense,
    });
  } catch (error) {
    console.error("Erreur lors de la modification de la soutenance :", error);
    return res.status(500).json({
      message: "Erreur interne du serveur.",
      error: error.message,
    });
  }
};

// Publier ou masquer les soutenances
exports.publishDefenses = async (req, res) => {
  try {
    const { response } = req.params;
    if (response !== "true" && response !== "false") {
      return res.status(400).json({ message: "La réponse doit être 'true' ou 'false'." });
    }

    const result = await DefensePublisher.publishDefenses(response);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fichier : controllers/defenseController.js
const DefenseScheduler = require("../services/DefenseScheduler");
const DefensePublisher = require("../services/DefensePublisher");
const DefenseEmailService = require("../services/DefenseEmailService");

// Planifier les soutenances
exports.createDefenses = async (req, res) => {
  try {
    const { dates, rooms, startTime, endTime } = req.body;
    if (!dates || !rooms || !startTime || !endTime) {
      return res.status(400).json({ message: "Données manquantes." });
    }

    const defenses = await DefenseScheduler.scheduleDefenses(dates, rooms, startTime, endTime);
    res.status(200).json({
      message: "Soutenances créées avec succès.",
      defenses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Publier ou masquer les soutenances
exports.publishDefenses = async (req, res) => {
  try {
    const { response } = req.params;
    if (response !== "true" && response !== "false") {
      return res.status(400).json({ message: "La réponse doit être 'true' ou 'false'." });
    }

    const result = await DefensePublisher.publishDefenses(response);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Envoyer la liste des soutenances par e-mail
exports.sendDefensesList = async (req, res) => {
  try {
    const recipients = ["fitourions@gmail.com", "oumaimahrnii@gmail.com"]; // Liste des destinataires
    const result = await DefenseEmailService.sendDefensesList(recipients);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherDefenses = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        message: "L'ID de l'enseignant est requis."
      });
    }

    const defenses = await Defense.find({
      $or: [
        { teacher: teacherId },
        { rapporteur: teacherId }
      ]
    })
      .populate("pfa", "title description") 
      .populate("room", "name") 
      .select("date time"); 

    if (!defenses.length) {
      return res.status(404).json({
        message: "Aucune soutenance trouvée pour cet enseignant."
      });
    }

    res.status(200).json({
      message: "Soutenances trouvées avec succès.",
      defenses
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des soutenances :", error);
    res.status(500).json({
      message: "Erreur interne du serveur.",
      details: error.message
    });
  }
};

exports.getDefenseDetails = async (req, res) => {
  try {
    const { defenseId } = req.params;

    if (!defenseId) {
      return res.status(400).json({
        message: "L'ID de la soutenance est requis."
      });
    }

    const defense = await Defense.findById(defenseId)
      .populate("pfa", "title description student")
      .populate("teacher", "name email")
      .populate("rapporteur", "name email")
      .populate("room", "name");

    if (!defense) {
      return res.status(404).json({
        message: "Soutenance introuvable."
      });
    }

    res.status(200).json({
      message: "Détails de la soutenance récupérés avec succès.",
      defense
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la soutenance :", error);
    res.status(500).json({
      message: "Erreur interne du serveur.",
      details: error.message
    });
  }
};

exports.getStudentDefense = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Étape 1 : Trouver le PFA de l'étudiant
    const pfa = await PFA.findOne({ student: studentId }).select("_id title description");
    if (!pfa) {
      return res.status(404).json({
        message: "Aucun PFA trouvé pour cet étudiant.",
      });
    }

    // Étape 2 : Trouver la soutenance associée
    const defense = await Defense.findOne({ pfa: pfa._id })
      .populate("teacher", "firstName lastName email")
      .populate("rapporteur", "firstName lastName email")
      .select("date time room published");

    if (!defense) {
      return res.status(404).json({
        message: "Aucune soutenance trouvée pour ce PFA.",
      });
    }

    res.status(200).json({
      message: "Soutenance trouvée avec succès.",
      defense: {
        ...defense.toObject(),
        pfa, // Inclure les détails du PFA
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la soutenance :", error);
    res.status(500).json({
      message: "Erreur interne du serveur.",
      details: error.message,
    });
  }
};