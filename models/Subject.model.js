const mongoose = require('mongoose');
const Chapter = require('./Chapter.model');
const Competence = require('./Competence.model');
const Evaluation = require('./Evaluation.model');

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
  chapters: {
    type: [Chapter.schema], // Embedded array of Chapter subdocuments
    required: false,
  },
  competences: {
    type: [Competence.schema], // Embedded array of Competence subdocuments
    required: false,
  },
  evaluation: {
    type: Evaluation.schema, // Single embedded document for Evaluation
    required: false,
  },
});

// Create the Subject model
const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
