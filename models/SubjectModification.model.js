const mongoose = require('mongoose');
const Subject = require('./Subject.model');
const { string } = require('joi');

// Define the Subject schema
const subjectModificationSchema = new mongoose.Schema({

  id_Subject: {
    type: Number, 
    required: true,
  }, 
  raison: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: Subject.schema, 
    required: false,
  },
  validated:{
    type: Boolean,
    default:false,
  },
});

// Create the Subject model
const SubjectModification = mongoose.model('SubjectModification', subjectModificationSchema);

module.exports = SubjectModification;