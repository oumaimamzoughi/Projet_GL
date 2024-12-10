const PFA = require("../models/PFA.mode");
const Period = require("../models/Period.model");
const { sendEmail } = require("../services/emailService");


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
      return res
        .status(400)
        .json({ message: "No open period for teacher submissions." });
    }

    
    // Si la période est ouverte et l'utilisateur est connecté, créer le PFA
    const { title, description, technologies, pair_work, cin_student } =
      req.body;

    const newPFA = new PFA({
      title,
      description,
      technologies,
      pair_work,
      cin_student,
       teacher: req.auth.userId,
       
      //  // Ajout de l'ID de l'utilisateur connecté
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

// Get a specific PFA by ID
exports.getPFAById = async (req, res) => {
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

// Update a PFA by ID
exports.updatePFA = async (req, res) => {
  try {
    const pfa = await PFA.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!pfa) {
      return res.status(404).json({ message: "PFA not found" });
    }
    res.status(200).json(pfa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a PFA by ID
exports.deletePFA = async (req, res) => {
  try {
    const pfa = await PFA.findByIdAndDelete(req.params.id);
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
    const { isModified } = req.body; // Booléen indiquant si la liste est modifiée
    const recipients = ['fitourions@gmail.com', 'oumaimahrnii@gmail.com']; // Liste des destinataires
    const subject = isModified 
        ? 'Liste des sujets PFA mise à jour' 
        : 'Première liste des sujets PFA publiés';
    //const baseUrl = 'https://votre-plateforme.com/PFA'; // URL de la liste
    const message = isModified 
        ? `La liste des sujets PFA a été modifiée. Consultez les nouveaux sujets ici : `
        : `Voici la liste des sujets PFA publiés : `;

    try {
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



