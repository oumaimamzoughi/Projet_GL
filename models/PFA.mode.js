const mongoose = require('mongoose');

// Define the PFA schema
const pfaSchema = new mongoose.Schema({
  
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
    default: 'ongoing', // Default status
  },
  state: {
    type: String, // Current state of the PFA
    default: 'null', // Default state
  },
  cin_student: {
    type: Number, // Student name or ID
    default: null, 
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User", // Teacher name or ID
    required: true, 
  },
});

// Create the PFA model
const PFA = mongoose.model('PFA', pfaSchema);

module.exports = PFA;
