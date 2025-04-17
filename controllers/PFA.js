const PFA = require("../models/PFA.mode");
const Period = require("../models/Period.model");
const SubjectChoice = require("../models/SubjectChoice.model")
const User = require("../models/User.model")
const { sendEmail } = require("../services/emailService");
const Mail = require("../models/email.model");


// Create a new PFA
exports.createPFA = async (req, res) => {
  try {
      // Vérifier si une période de type 'teacher_submission' est ouverte
      const currentDate = new Date();
      const openPeriod = await Period.findOne({
          type: "teacher_submission",
          end_date: { $gt: currentDate }, // end_date > currentDate
      });

      if (!openPeriod) {
          return res.status(400).json({ message: "No open period for teacher submissions." });
      }

      // Si la période est ouverte et l'utilisateur est connecté, créer le PFA
      const { title, description, technologies, pair_work, cin_student, partner_id } = req.body;

      // Vérification OCL : Si pair_work est true, partner_id doit être valide
      if (pair_work) {
          if (!partner_id) {
              return res.status(400).json({ message: "When pair_work is true, partner_id must be provided." });
          }
          const partner = await User.findById(partner_id);
          if (!partner || partner.role !== "student") {
              return res.status(400).json({ message: "partner_id must reference an existing student." });
          }
      }

      const newPFA = new PFA({
          title,
          description,
          technologies,
          pair_work,
          partner_id, // Ajoutez partner_id ici
          cin_student,
          teacher: req.auth.userId,
      });

      // Sauvegarder le PFA dans la base de données
      await newPFA.save();
      res.status(201).json(newPFA);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// Get all PFAs
exports.getAllPFAs = async (req, res) => {
  try {
    const pfas = await PFA.find();
    res.status(200).json(pfas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPFAByAdmin_Id = async (req, res) => {
  try {
    const pfa = await PFA.findById(req.params.id);
    if (!pfa) {
      return res.status(404).json({ message: "PFA not found" });
    }
    res.status(200).json(pfa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get a specific PFA by ID
exports.getPFAById = async (req, res) => {
  try {
    const pfa = await PFA.findById(req.params.id)
    .populate("teacher", "firstName lastName email") 
    .select("title description technologies pair_work teacher status"); // Champs nécessaires
    if (!pfa) {
      return res.status(404).json({ message: "PFA not found" });
    }
    res.status(200).json(pfa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a PFA by ID
exports.updatePFA = async (req, res) => {
  try {
    // Vérifier si une période de type 'teacher_submission' est ouverte
    const currentDate = new Date();
    const openPeriod = await Period.findOne({
      type: "teacher_submission",
      end_date: { $gt: currentDate }, // end_date > currentDate
    });

    if (!openPeriod) {
      return res
        .status(400)
        .json({ message: "No open period for teacher submissions." });
    }

    // Vérifier si le sujet appartient à l'enseignant connecté
    const teacherId = req.auth.userId; // ID de l'enseignant connecté
    const pfa = await PFA.findById(req.params.id);

    if (!pfa) {
      return res.status(404).json({ message: "PFA not found." });
    }

    if (String(pfa.teacher) !== String(teacherId)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this PFA." });
    }

    // Mettre à jour le PFA
    const updatedPFA = await PFA.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedPFA);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a PFA by ID
exports.deletePFA = async (req, res) => {
  try {
    const currentDate = new Date();
    const openPeriod = await Period.findOne({
      type: "teacher_submission",
      end_date: { $gt: currentDate }, // end_date > currentDate
    });

    if (!openPeriod) {
      return res
        .status(400)
        .json({ message: "No open period for teacher submissions." });
    }
    // Vérifier si le sujet appartient à l'enseignant connecté
    const teacherId = req.auth.userId; // ID de l'enseignant connecté
    const pfa = await PFA.findById(req.params.id);

    if (!pfa) {
      return res.status(404).json({ message: "PFA not found." });
    }

    if (String(pfa.teacher) !== String(teacherId)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this PFA." });
    }
    if (!pfa) {
      return res.status(404).json({ message: "PFA not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.rejectPFA = async (req, res) => {
  try {
    // Trouver le PFA par ID
    const pfa = await PFA.findById(req.params.id);

    if (!pfa) {
      return res.status(404).json({ message: "PFA not found" });
    }

    // Mettre à jour le statut à "rejected"
    pfa.status = "rejected";
    await pfa.save();
    
    res.status(200).json({
      message: "PFA has been rejected successfully.",
      pfa,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeachersPFAMinee = async (req, res) => {
  try {
      // Filtre pour récupérer uniquement les sujets postés par l'enseignant authentifié
      const teacherId = req.auth.userId
      console.log("User :", teacherId)
      const projects_pfa = await PFA.find({ teacher: teacherId })

      res.status(200).json({ model: projects_pfa, message: 'Succès' })
    } catch (e) {
      res.status(400).json({ error: e.message, message: "Problème d'accès" })
    }
  }

  exports.getPFADetailsTeacher = async (req, res) => {
    try {
      // Récupérer l'ID du PFA à partir des paramètres de la requête
      const pfaId = req.params.id;
      const teacherId = req.auth.userId; // ID de l'enseignant connecté (injecté par loggedMiddleware)

      // Vérifier que le PFA appartient à l'enseignant connecté
      const pfa = await PFA.findOne({ _id: pfaId, teacher: teacherId });

      if (!pfa) {
        return res.status(403).json({ message: "Ce sujet ne vous appartient pas." });
      }

      // Retourner les informations du PFA
      res.status(200).json({ pfa, message: "Succès" });
    } catch (error) {
      res.status(500).json({ error: error.message, message: "Erreur serveur." });
    }
  };


// Fonction pour sauvegarder ou mettre à jour la période de choix des PFA
const saveOrUpdatePfaChoicePeriod = async (startDate, endDate) => {
  try {

      // Vérification si la date de début est supérieure à la date de fin
      if (new Date(startDate) > new Date(endDate)) {
      throw new Error("La date de début ne peut pas être postérieure à la date de fin.");
      }
      const updatedPeriod = await Period.findOneAndUpdate(
          { type: 'pfa_choice_submission' }, // Filtre basé sur le type de la période
          { start_date: startDate, end_date: endDate, type: 'pfa_choice_submission' }, // Données à mettre à jour
          { upsert: true, new: true } // Crée une nouvelle entrée si elle n'existe pas
      );
      console.log(`Période de choix des PFA sauvegardée : du ${startDate} au ${endDate}`);
      return updatedPeriod; // Retourne la période mise à jour
  } catch (error) {
      console.error("Erreur lors de la sauvegarde de la période :", error.message);
      throw error;
  }
};

// Fonction pour publier les PFA
exports.publishPFA = async (req, res) => {
  const { response } = req.params; // Récupère le paramètre "response" (true ou false)
  const { startDate, endDate } = req.body; // Récupère les dates de début et de fin de la période
  
  try {
      if (response === 'true') {
          // Récupérer les PFA non rejetés
          const pfas = await PFA.find({ status: { $ne: 'rejected' } });
          if (pfas.length === 0) {
              return res.status(404).json({ message: 'Aucun PFA non rejeté trouvé.' });
          }

          // Publier les PFA non rejetés (changer leur statut en "publié")
          await PFA.updateMany({ status: { $ne: 'rejected' } }, { $set: { status: 'publié' } });
          console.log("PFA non rejetés publiés avec succès.");
          
          // Si des dates sont fournies, mettre à jour la période de choix des étudiants
          if (startDate && endDate) {
              await saveOrUpdatePfaChoicePeriod(startDate, endDate);
          }

          return res.status(200).json({ message: 'PFA publiés et période de choix mise à jour.' });
      } else {
          // Masquer tous les PFA (rendre invisibles)
          await PFA.updateMany({}, { $set: { isVisible: false } }); // Exemple de champ `isVisible`
          console.log("Liste des PFA masquée.");

          return res.status(200).json({ message: 'Liste des PFA masquée.' });
      }
  } catch (error) {
      console.error("Erreur lors de la publication des PFA :", error.message);
      res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
};

//emailing
exports.sendPFAList = async (req, res) => {
    
    const recipients = ['fitourions@gmail.com', 'oumaimahrnii@gmail.com']; // Liste des destinataires
    try {
      // Récupérer la configuration d'envoi
          let mailConfig = await Mail.findOne();
      
          // Si la configuration n'existe pas, la créer
          if (!mailConfig) {
            mailConfig = new Mail();
            await mailConfig.save();
          }
      
          const isModified = mailConfig.isModified;
          const subject = isModified
            ? "Liste des sujets PFA mise à jour"
            : "Première liste des sujets PFE publiés";
          const message = isModified
            ? "La liste des sujets PFE a été modifiée. Consultez les nouveaux sujets ici."
            : "Voici la liste des sujets PFE publiés.";
      
        // Récupérer les PFA publiés
        const publishedPFAs = await PFA.find({ status: 'publié' });
        if (publishedPFAs.length === 0) {
            return res.status(404).json({ message: 'Aucun sujet PFA publié à envoyer.' });
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

        res.status(200).json({ message: 'Liste des sujets PFA envoyée avec succès.', sentAt: now });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la liste des sujets PFA :', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
    }
};

//Lister les sujets pfa triés par enseignant
exports.getPFAsByTeacher = async (req, res) => {
  try {
      // Récupérer les sujets avec les champs nécessaires
      const pfas = await PFA.find()
            .populate('teacher', 'firstName lastName email') // Récupérer les informations de l'enseignant depuis User
            .sort({ 'teacher.lastName': 1 }); // Trier par le nom de famille de l'enseignant


      // Vérifier si des sujets existent
      if (!pfas.length) {
          return res.status(404).json({ message: 'Aucun sujet PFA trouvé.' });
      }

      // Retourner les sujets triés
      res.status(200).json(pfas);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

//choisir pfa
exports.createSubjectChoice = async (req, res) => {
  try {
    const studentId = req.auth.userId; // Assurez-vous que l'ID de l'étudiant est dans req.auth
    const { priority, partner, teacherApproval } = req.body;

    // Vérifier le nombre total de choix
    const totalChoices = await SubjectChoice.countDocuments({ student: studentId });
    if (totalChoices >= 3) {
      return res.status(400).json({ error: "Vous avez déjà sélectionné 3 sujets." });
    }

    // Vérifier que la priorité est valide
    if (![1, 2, 3].includes(priority)) {
      return res.status(400).json({ error: "La priorité doit être 1, 2 ou 3." });
    }

    // Vérifier que le sujet PFA existe et n'est pas déjà affecté
    const pfa = await PFA.findById(req.params.id);
    if (!pfa) {
      return res.status(404).json({ error: "Sujet PFA introuvable." });
    }
    if (pfa.state === "affecté") {
      return res.status(400).json({ error: "Le sujet a déjà été affecté définitivement." });
    }

    // Vérifier que le binôme est valide
    if (partner) {
      const partnerExists = await User.findById(partner);
      if (!partnerExists || partnerExists.role !== "student") {
        return res.status(400).json({ error: "Le binôme indiqué n'est pas valide." });
      }
    }

    // Résoudre les conflits de priorité pour l'étudiant
    let adjustedPriority = priority;
    const conflictChoice = await SubjectChoice.findOne({
      student: studentId,
      priority: adjustedPriority,
    });

    if (conflictChoice) {
      // Modifier la priorité de l'ancien choix de l'étudiant
      const takenPriorities = await SubjectChoice.find({ student: studentId }).distinct("priority");

      const availablePriorities = [1, 2, 3].filter((p) => !takenPriorities.includes(p));
      if (availablePriorities.length > 0) {
        const newPriorityForOldChoice = availablePriorities[0];
        conflictChoice.priority = newPriorityForOldChoice;
        await conflictChoice.save();

        adjustedPriority = priority; // La priorité actuelle reste inchangée pour le nouveau choix
      } else {
        return res.status(400).json({ error: "Aucune priorité disponible pour ce sujet." });
      }
    }

    // Créer le choix principal
    const newChoice = new SubjectChoice({
      subject_name: pfa.title,
      priority: adjustedPriority,
      student: studentId,
      pfa: pfa._id,
      teacherApproval,
      partner,
    });

    await newChoice.save();

    if (partner) {
      const partnerChoice = new SubjectChoice({
        subject_name: pfa.title,
        priority: adjustedPriority,
        student: partner,
        pfa: pfa._id,
        teacherApproval,
        partner: studentId,
      });

      await partnerChoice.save();
    }

    res.status(201).json({
      message: `Sujet choisi avec priorité ${adjustedPriority}.`,
      newChoice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//indiquer acceptation de l'enseignant
exports.indicateTeacherApproval = async (req, res) => {
  
  try {
    const studentId = req.auth.userId; // ID de l'étudiant
    const pfaId = req.params.id; // ID du PFA dans l'URL
    const { teacherApproval } = req.body; // Donnée envoyée dans le corps de la requête

    // Recherche du PFA avec l'ID passé dans l'URL
    const subjectChoice = await SubjectChoice.findOne({
      student: studentId,
      pfa: pfaId,
    });

    if (!subjectChoice) {
      return res.status(404).json({ error: "Choix de sujet non trouvé." });
    }

    // Vérifier si le sujet a déjà l'approbation de l'enseignant
    if (subjectChoice.teacherApproval) {
      return res.status(400).json({ error: "Ce choix a déjà été approuvé par l'enseignant." });
    }

    // Mise à jour de l'acceptation par l'enseignant
    subjectChoice.teacherApproval = teacherApproval;
    await subjectChoice.save();
    const pfa = await PFA.findById(pfaId);
    if (teacherApproval) {
      pfa.state = "affecté";
      await pfa.save();
    }

    return res.status(200).json({
      message: "L'approbation de l'enseignant a été mise à jour.",
      subjectChoice,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Associer un étudiant (ou binôme) à un projet
exports.assignStudentToPFA = async (req, res) => {
  try {
    const { studentId, partnerId } = req.body; // Récupération de l'ID de l'étudiant et de son binôme depuis le corps de la requête

    const pfa = await PFA.findById(req.params.id); // Recherche du PFA par son ID

    if (!pfa) {
      return res.status(404).json({ error: "PFA non trouvé." });
    }

    // Vérifier si le PFA nécessite un binôme
    if (pfa.pair_work) {
      if (!partnerId) {
        return res.status(400).json({ error: "Un binôme est requis pour ce sujet." });
      }

      // Vérifier si le partenaire existe
      const partner = await User.findById(partnerId);  // Assurez-vous que vous avez le modèle User importé
      if (!partner) {
        return res.status(404).json({ error: "Binôme non trouvé." });
      }

      // Affecter le sujet au PFA et aux deux étudiants
      pfa.student = studentId;
      pfa.partner_id = partnerId;  // Attribuer le binôme au PFA
    } else {
      // Si le PFA ne nécessite pas de binôme, affecter uniquement l'étudiant
      pfa.student = studentId;
      pfa.partner_id = null;  // Pas de partenaire si le PFA ne nécessite pas de binôme
    }
    // Mise à jour du statut du PFA
    pfa.state = "affecté";
    await pfa.save(); // Sauvegarder les changements dans le PFA

    res.status(200).json({ message: "Etudiant affecté au PFA.", pfa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// //affecter PFA avec force
// exports.assignPFA = async (req, res) => {
//   try {
//     const adminId = req.auth.userId; // ID de l'utilisateur connecté (admin)
//     const { studentId, pfaId, force } = req.body; // Inclure "force" dans la requête

//     // Vérifier si l'utilisateur connecté est un administrateur
//     const admin = await User.findById(adminId);
//     if (!admin || admin.role !== 'admin') {
//       return res.status(403).json({ error: "Accès refusé. Seuls les administrateurs peuvent affecter un PFA." });
//     }

//     // Vérifier si l'étudiant existe
//     const student = await User.findById(studentId);
//     if (!student || student.role !== 'student') {
//       return res.status(400).json({ error: "L'étudiant spécifié n'existe pas ou n'est pas un étudiant valide." });
//     }

//     // Vérifier si le PFA existe
//     const pfa = await PFA.findById(pfaId);
//     if (!pfa) {
//       return res.status(404).json({ error: "Le PFA spécifié n'existe pas." });
//     }

//     // Si le PFA est déjà affecté
//     if (pfa.state === 'affecté') {
//       if (force !== true) {
//         return res.status(400).json({ error: "Le PFA est déjà affecté. Ajoutez 'force=true' pour le réaffecter." });
//       }

//       // Retirer le PFA de l'étudiant précédent
//       const previousStudent = await User.findById(pfa.student);
//       if (previousStudent) {
//         console.log(`Le PFA est retiré de l'étudiant précédent : ${previousStudent.name}`);
//       }

//       pfa.student = null; // Réinitialiser l'affectation
//     }

//     // Affecter le PFA au nouvel étudiant
//     pfa.student = studentId;
//     pfa.state = 'affecté';
//     await pfa.save();

//     res.status(200).json({ message: "Le PFA a été réaffecté avec succès.", pfa });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
