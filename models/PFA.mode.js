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
    type: mongoose.Schema.Types.ObjectId, // ID of the partner (if pair work)
    default: null, // Default is null when no partner
    ref: 'User', // Reference to the User model (partner)
  },
  status: {
    type: String, // Status of the PFA
    default: 'ongoing', // Default status
  },
  state: {
    type: String, // Current state of the PFA
    default: 'non affecté', // Default state
  },
  
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User", // Teacher name or ID
    required: true, 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, // ID of the partner (if pair work)
    default: null, // Default is null when no partner
    ref: 'User', // Reference to the User model (partner)
  },
  
  isSent: {
    type: Boolean,
    default: false, // Indique si ce PFA a déjà été envoyé
},
lastSentDate: {
    type: Date, // Date du dernier envoi de ce PFA
},
});

// Create the PFA model
const PFA = mongoose.model('PFA', pfaSchema);

module.exports = PFA;
