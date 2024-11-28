const mongoose = require('mongoose');

// Define the Section schema
const sectionSchema = new mongoose.Schema({
  id_Section: {
    type: Number, // Integer for the section ID
    required: true,
    unique: true,
  },
  name: {
    type: String, // Name of the section
    required: true,
    trim: true,
  },
  content: {
    type: String, // Content of the section
    required: true,
    trim: true,
  },
  status: {
    type: String, // Status of the section (e.g., "active", "inactive")
    required: true,
    trim: true,
  },
});

// Create the Section model
const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
