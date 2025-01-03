const mongoose = require('mongoose');

// Define the Defense schema
const defenseSchema = new mongoose.Schema({
  pfa: {
    type: mongoose.Schema.Types.ObjectId, // Référence au PFA
    ref: 'PFA',
    required: true,
    
  },
  date: {
    type: Date, // Date de la soutenance
    required: true,
  },
  room: {
    type: String, // Salle de la soutenance
    required: true,
  },
  time: {
    type: String, // Heure de la soutenance
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId, // Référence à l'enseignant
    ref: 'User',
    required: true,
  },
  rapporteur: {
    type: mongoose.Schema.Types.ObjectId, // Référence au rapporteur
    ref: 'User',
    required: false,
  },
  published: {
    type: Boolean,
    default: false, 
  },

},{ timestamps: true });

const Defense = mongoose.model('Defense', defenseSchema);

module.exports = Defense;

