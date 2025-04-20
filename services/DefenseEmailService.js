const Defense = require("../models/Defense.model");
const Mail = require("../models/email.model");
const { sendEmail } = require("../services/emailService");

class DefenseEmailService {
  // Méthode pour envoyer la liste des soutenances par e-mail
  async sendDefensesList(recipients) {
    try {
      // Récupérer la configuration d'envoi
      let mailConfig = await Mail.findOne();
      if (!mailConfig) {
        mailConfig = new Mail();
        await mailConfig.save();
      }

      const isModified = mailConfig.isModified;
      const subject = isModified
        ? "Liste des soutenances PFA mise à jour"
        : "Première liste des soutenances PFA publiées";
      const message = isModified
        ? "La liste des soutenances PFA a été modifiée. Consultez les nouvelles soutenances ici."
        : "Voici la liste des soutenances PFA publiées.";

      // Récupérer les soutenances publiées
      const publishedDefenses = await Defense.find({ published: true });
      if (publishedDefenses.length === 0) {
        throw new Error("Aucune soutenance publiée à envoyer.");
      }

      // Envoyer un e-mail aux destinataires
      for (const recipient of recipients) {
        console.log(`Envoi à : ${recipient}`);
        await sendEmail({
          to: recipient,
          subject,
          text: message,
          html: `<p>${message}</p>`,
        });
      }

      // Mettre à jour la configuration d'envoi
      const now = new Date();
      mailConfig.isModified = true; // À partir de la deuxième fois, la liste est marquée comme modifiée
      mailConfig.lastSentDate = now;
      await mailConfig.save();

      return {
        message: "Liste des soutenances envoyée avec succès.",
        sentAt: now,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de la liste des soutenances :", error);
      throw error;
    }
  }
}

module.exports = new DefenseEmailService();