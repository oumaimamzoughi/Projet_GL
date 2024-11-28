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
  studentId:{
    type:string,
    required:true,
    unique:true,
},
PFA: {
    type: [PFA.schema], // Embedding the PFA subdocument
    validate: {
      validator: function (arr) {
        return arr.length === 3; // Ensure exactly 3 PFAs are provided
      },
      message: 'A subject choice must have exactly 3 PFA entries',
    },
  },
});

// Create the SubjectChoice model
const SubjectChoice = mongoose.model('SubjectChoice', subjectChoiceSchema);

module.exports = SubjectChoice;
