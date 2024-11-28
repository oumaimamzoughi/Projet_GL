const mongoose = require('mongoose');

// Define the Subject schema
const subjectSchema = new mongoose.Schema({
  id_Subject: {
    type: Number, // Integer for the subject ID
    required: true,
    unique: true,
  },
  title: {
    type: String, // Title of the subject
    required: true,
    trim: true,
  },
  description: {
    type: String, // Description of the subject
    required: false,
    trim: true,
  },
  nb_hour: {
    type: Number, // Number of hours for the subject
    required: true,
  },
  semester: {
    type: String, // Semester during which the subject is taught
    required: true,
    trim: true,
  },
  level: {
    type: String, // Level of the subject (e.g., "beginner", "intermediate", "advanced")
    required: true,
    trim: true,
  },
});

// Create the Subject model
const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
