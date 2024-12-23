const mongoose = require('mongoose');

// Define the Period schema
const periodSchema = new mongoose.Schema({
  start_date: {
    type: Date, // Start date of the period
    required: true,
  },
  end_date: {
    type: Date, // End date of the period
    required: true,
  },
  type: {
    type: String, // Type of the period
    enum: ['teacher_submission', 'internship_submission', 'pfa_choice_submission', 'internship_submission_2eme', 'internship_submission_1ere'], // Allowed values
    required: true, // Mandatory field
  },
});

// Create the Period model
const Period = mongoose.model('Period', periodSchema);

module.exports = Period;
