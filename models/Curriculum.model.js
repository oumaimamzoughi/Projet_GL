const mongoose = require('mongoose');
const Subject = require('./Subject.model');

// Define the Curriculum schema
const curriculumSchema = new mongoose.Schema({
  id_Curriculum: {
    type: Number, 
    required: true,
    unique: true,
  },
  subjectName: {
    type: String, 
    required: true,
    trim: true,
  },
  objective: {
    type: String, 
    required: true,
  },
  workload: {
    type: String, 
    required: true,
  },
  subjects: [Subject.schema],
});

// Create the Curriculum model
const Curriculum = mongoose.model('Curriculum', curriculumSchema);

module.exports = Curriculum;
