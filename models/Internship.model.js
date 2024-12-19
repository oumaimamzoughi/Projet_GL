const mongoose = require('mongoose');

// Define the Internship schema
const internshipSchema = new mongoose.Schema({
 
  title: {
    type: String, // Title of the internship
    required: true,
    trim: true,
  },
  type:{
    type:String,
    required:true,
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
    ref: 'User', // Reference to the User model (the student who posted the internship)
    required: false,
  },

  googleMeetLink: {
    type: String, // Link to the Google Meet for presentations, if applicable
    required: false,
  },planningStatus: {
    type: String,
    enum: ['published', 'hidden'],
    default: 'hidden', // Default state is hidden
  },
  emailSent: {
    type: Boolean,
    default: false, // Tracks if the planning email has been sent
  },

}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` timestamps
});

// Create the Internship model
const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;
