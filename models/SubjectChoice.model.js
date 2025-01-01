const mongoose = require('mongoose');
const PFA = require('./PFA.mode');

// Define the SubjectChoice schema
const subjectChoiceSchema = new mongoose.Schema({
  subject_name: {
    type: String, // Name of the subject
    required: true,
    trim: true,
  },
  priority: {
    type: Number, // Priority level of the subject
    required: true,
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Référence à l'étudiant
    required: true, 
  },
  pfa: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PFA', // Référence au PFA
    required: true, 
  },
  teacherApproval: { 
    type: Boolean, 
    required: true,
    default: false,
  },
  partner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Référence au binôme (si applicable)
    default: null, 
  },
  force: {
    type: Boolean, // Indicates if pair work is involved
  default: false,
  }
}, {
  timestamps: true,
});

// Create the SubjectChoice model
const SubjectChoice = mongoose.model('SubjectChoice', subjectChoiceSchema);

module.exports = SubjectChoice;
