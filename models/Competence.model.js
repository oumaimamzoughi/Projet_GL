const mongoose = require('mongoose');

// Define the Competence schema
const competenceSchema = new mongoose.Schema({
  id_Competence: {
    type: Number, // Integer for the competence ID
    required: true,
    unique: true,
  },
  title: {
    type: String, // Title of the competence
    required: true,
    trim: true,
  },
  force: {
    type: Boolean, // Indicates if the competence is strong or essential
    required: true,
  },
});

// Create the Competence model
const Competence = mongoose.model('Competence', competenceSchema);

module.exports = Competence;
