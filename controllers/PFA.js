const PFA = require("../models/PFA.mode");
const Period = require("../models/Period.model");

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