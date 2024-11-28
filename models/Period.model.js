const mongoose = require('mongoose');

// Define the Period schema
const periodSchema = new mongoose.Schema({
  period_id: {
    type: Number, // Integer for the period ID
    required: true,
    unique: true,
  },
  start_date: {
    type: Date, // Start date of the period
    required: true,
  },
  end_date: {
    type: Date, // End date of the period
    required: true,
  },
});

// Create the Period model
const Period = mongoose.model('Period', periodSchema);

module.exports = Period;
