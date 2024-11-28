const mongoose = require('mongoose');

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
});

// Create the Curriculum model
const Curriculum = mongoose.model('Curriculum', curriculumSchema);

module.exports = Curriculum;
