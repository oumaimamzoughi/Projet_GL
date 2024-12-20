const mongoose = require('mongoose');

// Define the Section schema
const sectionSchema = new mongoose.Schema({
  id_Section: {
    type: String,
    unique: true, // REMOVE this if `null` values are expected
    sparse: true, // ADD this if you still want unique non-null values
  },
  name: {
    type: String,
    trim: true,
  },
});

// Create the Section model
const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
