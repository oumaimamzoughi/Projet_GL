const Defense = require("../models/Defense.model");

class DefensePublisher {
  // Méthode pour publier ou masquer toutes les soutenances
  async publishDefenses(response) {
    try {
      const isPublished = response === "true"; // Convertir en booléen
      const updatedDefenses = await Defense.updateMany(
        {}, // Filtre vide pour cibler toutes les soutenances
        { published: isPublished } // Mise à jour du champ 'published'
      );

      if (updatedDefenses.matchedCount === 0) {
        throw new Error("Aucune soutenance trouvée à mettre à jour.");
      }

      return {
        message: isPublished
          ? "Toutes les soutenances ont été publiées avec succès."
          : "Toutes les soutenances ont été masquées avec succès.",
        updatedCount: updatedDefenses.modifiedCount, // Nombre de soutenances modifiées
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des soutenances :", error);
      throw error;
    }
  }
}

module.exports = new DefensePublisher();