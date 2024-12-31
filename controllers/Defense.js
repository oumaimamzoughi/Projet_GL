const Defense = require('../models/Defense.model');
const PFA = require('../models/PFA.mode');
const User = require('../models/User.model');
const { sendEmail } = require("../services/emailService");
const mongoose = require("mongoose");


exports.createDefenses = async (req, res) => {
  try {
    const { dates, rooms, startTime, endTime } = req.body;

    // Validation des données
    if (!dates || !rooms || !startTime || !endTime) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

    console.log('Données reçues:', { dates, rooms, startTime, endTime });

    const soutenanceDuration = 30; // Durée de chaque soutenance en minutes
    const maxDefensesPerDay = 6; // Limite quotidienne des soutenances

    // Récupérer les PFA affectés
    const pfas = await PFA.find({ state: 'affecté' });
    if (!pfas.length) {
      return res.status(400).json({ message: 'Aucun PFA affecté' });
    }

    console.log('PFA trouvés:', pfas);

    const defenses = []; // Tableau des soutenances
    let currentDateIndex = 0; // Index de la date actuelle
    let currentRoomIndex = 0; // Index de la salle actuelle
    let currentTime = new Date(`${dates[currentDateIndex]}T${startTime}`); // Heure de début initiale

    for (let i = 0; i < pfas.length; i++) {
      // Filtrer les soutenances planifiées pour le jour actuel
      const currentDayDefenses = defenses.filter(
        (defense) => defense.date === dates[currentDateIndex]
      );

      // Si la limite quotidienne est atteinte, passer à la date suivante
      if (currentDayDefenses.length >= maxDefensesPerDay) {
        currentDateIndex++;
        currentRoomIndex = 0;

        if (currentDateIndex >= dates.length) {
          return res.status(400).json({
            message: 'Pas assez de jours disponibles pour planifier toutes les soutenances.',
          });
        }

        currentTime = new Date(`${dates[currentDateIndex]}T${startTime}`);
      }

      // Vérifier si l'heure dépasse l'heure de fin
      const endTimeOfDay = new Date(`${dates[currentDateIndex]}T${endTime}`);
      if (currentTime >= endTimeOfDay) {
        currentDateIndex++;
        currentRoomIndex = 0;

        if (currentDateIndex >= dates.length) {
          return res.status(400).json({
            message: 'Pas assez de jours disponibles pour planifier toutes les soutenances.',
          });
        }

        currentTime = new Date(`${dates[currentDateIndex]}T${startTime}`);
      }

      // Formater l'heure au format "HH:mm"
      const formattedTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(
        currentTime.getMinutes()
      ).padStart(2, '0')}`;

      // Ajouter une soutenance
      const defense = {
        pfa: pfas[i]._id,
        date: dates[currentDateIndex],
        time: formattedTime, // Heure seulement
        room: rooms[currentRoomIndex],
        teacher: pfas[i].teacher,
        rapporteur: await getRapporteur(pfas[i].teacher), // Déterminer le rapporteur
      };

      defenses.push(defense);

      // Avancer l'heure pour la prochaine soutenance
      currentTime = new Date(currentTime.getTime() + soutenanceDuration * 60000);

      // Passer à la salle suivante si disponible
      currentRoomIndex = (currentRoomIndex + 1) % rooms.length;
    }

    console.log('Soutenances planifiées:', defenses);

    // Insérer les soutenances dans la base de données
    await Defense.insertMany(defenses);

    return res.status(200).json({
      message: 'Soutenances créées avec succès',
      defenses,
    });
  } catch (error) {
    console.error('Erreur lors de la création des soutenances:', error);
    return res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message,
    });
  }
};



// Fonction pour récupérer un rapporteur aléatoire
const getRapporteur = async (teacherId) => {
  try {
    const rapporteurs = await User.find({ role: 'teacher', _id: { $ne: teacherId } });

    if (rapporteurs.length) {
      const randomRapporteur = rapporteurs[Math.floor(Math.random() * rapporteurs.length)];
      console.log('Rapporteur choisi:', randomRapporteur);
      return randomRapporteur._id;
    }

    console.log('Aucun rapporteur trouvé');
    return null;

  } catch (error) {
    console.error('Erreur lors de la récupération des rapporteurs:', error);
    return null;
  }
};

//Consulter les soutenances
exports.getAllDefenses = async (req, res) => {
  try {
    // Récupérer toutes les soutenances
    const defenses = await Defense.find()
      .populate('pfa', 'title student') // Remplacer les IDs par les données des PFA (si besoin)
      .populate('teacher', 'firstName lastName') // Remplacer les IDs des enseignants par leurs noms
      .populate('rapporteur', 'firstName lastName') // Idem pour les rapporteurs
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

// Méthode pour publier ou masquer toutes les soutenances
exports.publishDefenses = async (req, res) => {
  try {
    const { response } = req.params; // Récupérer le paramètre response (true ou false)

    // Validation du paramètre response
    if (response !== 'true' && response !== 'false') {
      return res.status(400).json({
        message: "La réponse doit être 'true' ou 'false'."
      });
    }

    // Convertir response en booléen
    const isPublished = response === 'true';

    // Mettre à jour toutes les soutenances
    const updatedDefenses = await Defense.updateMany(
      {}, // Filtre vide pour cibler toutes les soutenances
      { published: isPublished }, // Mise à jour du champ published
      { new: true } // Option inutile ici mais utile pour spécifier le contexte
    );

    // Vérifier si des soutenances ont été modifiées
    if (updatedDefenses.matchedCount === 0) {
      return res.status(404).json({
        message: "Aucune soutenance trouvée à mettre à jour."
      });
    }

    res.status(200).json({
      message: isPublished
        ? "Toutes les soutenances ont été publiées avec succès."
        : "Toutes les soutenances ont été masquées avec succès.",
      updatedCount: updatedDefenses.modifiedCount // Nombre de soutenances modifiées
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des soutenances :", error);
    res.status(500).json({
      message: "Erreur interne du serveur.",
      details: error.message
    });
  }
};


//emailing
exports.sendDefensesList = async (req, res) => {
  const { isModified } = req.body; // Booléen indiquant si la liste est modifiée
  const recipients = ['fitourions@gmail.com', 'oumaimahrnii@gmail.com']; // Liste des destinataires
  const subject = isModified 
      ? 'Liste des soutenances mise à jour' 
      : 'Première liste des soutenances PFA publiés';
  //const baseUrl = 'https://votre-plateforme.com/PFA'; // URL de la liste
  const message = isModified 
      ? `La liste des soutenances PFA a été modifiée. Consultez le nouveaux planning ici : `
      : `Voici la liste des soutenances PFA publiés : `;

  try {
      // Récupérer les PFA publiés
      const publishedDefenses = await Defense.find({ published: true });
      if (publishedDefenses.length === 0) {
          return res.status(404).json({ message: 'Aucune soutenance publiée à envoyer.' });
      }

      // Envoyer un email aux destinataires
      for (const recipient of recipients) {
        console.log(`Envoi à : ${recipient}`);
        await sendEmail({
            to: recipient, // Destinataire
            subject, // Objet
            text: message, // Message brut
            html: `<p>${message}</p>`, // Message HTML
        });
      }

      // Mettre à jour les états d'envoi
      const now = new Date();
      await PFA.updateMany(
          { status: 'publié' }, 
          { $set: { isSent: true, lastSentDate: now } }
      );

      res.status(200).json({ message: 'Liste des soutenances PFA envoyée avec succès.', sentAt: now });
  } catch (error) {
      console.error('Erreur lors de l\'envoi de la liste des soutenances PFA :', error.message);
      res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
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
      .populate("pfa", "title description") // Inclure les détails du sujet
      .populate("room", "name") // Nom de la salle
      .select("date time"); // Inclure uniquement la date et l'heure

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