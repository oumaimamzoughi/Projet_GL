const mongoose = require('mongoose');

// Define the Internship schema
const internshipSchema = new mongoose.Schema({
  id: {
    type: Number, // Integer for the Internship ID
    required: true,
    unique: true,
  },
  title: {
    type: String, // Title of the internship
    required: true,
    trim: true,
  },
  documents: {
    type: String, // Documents related to the internship (e.g., URL or file path)
    required: false, // Optional field
  },
  status: {
    type: String, // Status of the internship (e.g., "pending", "approved", "completed")
    default: 'pending', // Default status
  },
});

// Create the Internship model
const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
