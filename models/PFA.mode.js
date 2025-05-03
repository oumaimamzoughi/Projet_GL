const mongoose = require("mongoose");

// Schéma de base pour PFA
const pfaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    technologies: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "ongoing",
    },
    state: {
      type: String,
      default: "non affecté",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "User",
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    lastSentDate: {
      type: Date,
    },
    force: {
      type: Boolean,
      default: false,
    },
  },
  { discriminatorKey: "type" } // Clé pour différencier les sous-types
);

// Modèle de base PFA
const PFA = mongoose.model("PFA", pfaSchema);

// Schéma pour PfaMonome (individuel)
const pfaMonomeSchema = new mongoose.Schema({
  pair_work: {
    type: Boolean,
    default: false, // Toujours false pour PfaMonome
  },
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User",
    validate: {
      validator: function (value) {
        return !value; // partner_id doit être null pour PfaMonome
      },
      message: "PfaMonome cannot have a partner_id.",
    },
  },
});

// Schéma pour PfaBinome (binôme)
const pfaBinomeSchema = new mongoose.Schema({
  pair_work: {
    type: Boolean,
    default: true, // Toujours true pour PfaBinome
  },
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // Obligatoire pour PfaBinome
    ref: "User",
    validate: {
      validator: async function (value) {
        const User = mongoose.model("User");
        const user = await User.findById(value);
        return user && user.role === "student";
      },
      message: "partner_id must reference an existing student.",
    },
  },
});

// Définir les sous-modèles avec discriminators
const PfaMonome = PFA.discriminator("PfaMonome", pfaMonomeSchema);
const PfaBinome = PFA.discriminator("PfaBinome", pfaBinomeSchema);

module.exports = { PFA, PfaMonome, PfaBinome };