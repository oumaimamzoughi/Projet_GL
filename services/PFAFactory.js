const PFA = require("../models/PFA.mode");

class PFAFactory {
  // Méthode pour créer un PFA standard
  createPFA(data) {
    const { title, description, technologies, pair_work, teacher } = data;
    return new PFA({
      title,
      description,
      technologies,
      pair_work,
      teacher,
      status: "ongoing", // Statut initial
      state: "non affecté", // État initial
    });
  }

  // Méthode pour créer un PFA avec binôme
  createPFAPairWork(data) {
    const { title, description, technologies, teacher, partner_id } = data;
    return new PFA({
      title,
      description,
      technologies,
      pair_work: true, // Forcer le binôme
      teacher,
      partner_id, // Ajouter l'ID du partenaire
      status: "ongoing",
      state: "non affecté",
    });
  }
}

module.exports = new PFAFactory(); // Exporter une instance unique de la factory