const PFA = require("../models/PFA.mode");
const User = require("../models/User.model");

class PFAAssigner {
  // Méthode pour affecter un étudiant (et éventuellement un binôme) à un PFA
  async assign(studentId, pfaId, partnerId = null) {
    const pfa = await PFA.findById(pfaId);
    if (!pfa) {
      throw new Error("PFA non trouvé.");
    }

    // Vérifier si le PFA nécessite un binôme
    if (pfa.pair_work && !partnerId) {
      throw new Error("Un binôme est requis pour ce sujet.");
    }

    // Vérifier si le binôme existe
    if (partnerId) {
      const partner = await User.findById(partnerId);
      if (!partner || partner.role !== "student") {
        throw new Error("Binôme non valide.");
      }
    }

    // Affecter l'étudiant (et éventuellement le binôme)
    pfa.student = studentId;
    pfa.partner_id = partnerId || null;
    pfa.state = "affecté";

    await pfa.save();
    return pfa;
  }
}

module.exports = new PFAAssigner();