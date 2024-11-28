const mongoose = require('mongoose');

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
});

// Create the SubjectChoice model
const SubjectChoice = mongoose.model('SubjectChoice', subjectChoiceSchema);

module.exports = SubjectChoice;
