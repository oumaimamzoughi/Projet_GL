const mongoose = require('mongoose');

// Define the Defense schema
const defenseSchema = new mongoose.Schema({
  id: {
    type: Number, // Integer for the Defense ID
    required: true,
    unique: true,
  },
  date: {
    type: Date, // Date of the defense
    required: true,
  },
  room: {
    type: String, // Room for the defense
    required: true,
  },
  hour: {
    type: String, // Time of the defense
    required: true,
  },
  teacher: {
    type: String, // Name of the teacher involved
    required: true,
  },
  student: {
    type: String, // Name of the student presenting
    required: true,
  },
  statut: {
    type: String, // Status of the defense (e.g., scheduled, completed)
    default: 'scheduled', // Default status
  },
});

// Create the Defense model
const Defense = mongoose.model('Defense', defenseSchema);

module.exports = Defense;
