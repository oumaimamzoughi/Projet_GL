const mongoose = require('mongoose');

// Define the PV schema
const pvSchema = new mongoose.Schema({
  id: {
    type: Number, // Integer for the PV ID
    required: true,
    unique: true,
  },
  pfa_code: {
    type: Number, // PFA code associated with the PV
    required: true,
  },
  subject_name: {
    type: String, // Name of the subject for the PV
    required: true,
    trim: true,
  },
  supervisor_name: {
    type: String, // Name of the supervisor
    required: true,
    trim: true,
  },
  rapporteur_name: {
    type: String, // Name of the rapporteur
    required: true,
    trim: true,
  },
  grade1: {
    type: Number, // Grade 1 for the PV
    required: false,
    min: 0,
    max: 100,
  },
  grade2: {
    type: Number, // Grade 2 for the PV
    required: false,
    min: 0,
    max: 100,
  },
  grade3: {
    type: Number, // Grade 3 for the PV
    required: false,
    min: 0,
    max: 100,
  },
  final_grade: {
    type: Number, // Final grade for the PV
    required: false,
    min: 0,
    max: 100,
  },
  observation: {
    type: String, // Observations related to the PV
    required: false,
    trim: true,
  },
});

// Create the PV model
const PV = mongoose.model('PV', pvSchema);

module.exports = PV;
