const mongoose = require('mongoose');
const Chapter = require('./Chapter.model');
const Competence = require('./Competence.model');
const Evaluation = require('./Evaluation.model');
const { string } = require('joi');

// Define the Subject schema
const subjectSchema = new mongoose.Schema({
  id_Subject: {
    type: Number, 
    required: true,
    unique: true,
  },
  title: {
    type: String, 
    required: true,
    trim: true,
  },
  masked:{
    type: Boolean,
    default:true,
  },
  used:{
    type: Boolean,
    default:false,
  },
  archive:{
    type: Boolean,
    default:false,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  nb_hour: {
    type: Number, 
    required: true,
  },
  semester: {
    type: String, 
    required: true,
    trim: true,
  },
  level: {
    type: String, 
    required: true,
    trim: true,
  },
  chapters: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Chapter'
    }
  ],
  competences: [
    {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Competence' ,
    }
  ],
  evaluation: {
    type: Evaluation.schema, 
    required: false,
  },
  advancement:{
    type:String,
  }
});

// Create the Subject model
const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
