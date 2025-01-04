const mongoose = require('mongoose');

// Define the Internship schema
const internshipSchema = new mongoose.Schema({
  title: {
    type: String, // Title of the internship
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
  },
  documents: {
    type: [String], // Array of documents (e.g., URLs, file paths)
    required: false, // Optional field
  },
  status: {
    type: String, // Status of the internship (e.g., "pending", "approved", "completed")
    default: 'pending', // Default status
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (the student who posted the internship)
    required: true, // Every internship must be linked to a student
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (the teacher who is assigned)
    required: false, // Optional, as not all internships may be assigned to a teacher
  },
  schedule: {
    date: {
      type: Date, // Use Date type for better date handling
      required: false, // Optional until explicitly scheduled
    },
    time: {
      type: String, // Can be stored as 'HH:mm' or 'HH:mm:ss'
      required: false,
    },
    googleMeetLink: {
      type: String, // Link to the Google Meet
      required: false,
    },
  },
  googleMeetLink: {
    type: String, // Link to the Google Meet for presentations, if applicable
    required: false,
  },
  planningStatus: {
    type: String,
    enum: ['published', 'hidden'],
    default: 'hidden', // Default state is hidden
  },
  emailSent: {
    type: Boolean,
    default: false, // Tracks if the planning email has been sent
  },
  validated: {
    type: Boolean,
    default: false, // Default to false, meaning not validated
  },
  validationReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` timestamps
});

// Create the Internship model
const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
