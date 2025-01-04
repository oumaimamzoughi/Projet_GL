const mongoose = require('mongoose');
const Subject = require('./Subject.model');
const { string } = require('joi');

const subjectModificationSchema = new mongoose.Schema({
  id_Subject: {
    type: String, 
    required: true,
  },
  id_user: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    required: true,
    ref: 'User',
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
  validated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SubjectModification = mongoose.model('SubjectModification', subjectModificationSchema);

module.exports = SubjectModification;
