const mongoose = require('mongoose');

// Define the PFA schema
const pfaSchema = new mongoose.Schema({
  id: {
    type: Number, // Integer for the PFA ID
    required: true,
    unique: true,
  },
  title: {
    type: String, // Title of the PFA
    required: true,
    trim: true,
  },
  description: {
    type: String, // Description of the PFA
    required: true,
  },
  technologies: {
    type: String, // Technologies used
    required: true,
  },
  pair_work: {
    type: Boolean, // Indicates if pair work is involved
    default: false,
  },
  partner_id: {
    type: Number, // ID of the partner (if pair work)
    default: null, // Default is null when no partner
  },
  status: {
    type: String, // Status of the PFA
    default: 'pending', // Default status
  },
  state: {
    type: String, // Current state of the PFA
    default: 'draft', // Default state
  },
  student: {
    type: String, // Student name or ID
    required: true,
  },
  teacher: {
    type: String, // Teacher name or ID
    required: true,
  },
});

// Create the PFA model
const PFA = mongoose.model('PFA', pfaSchema);

module.exports = PFA;
