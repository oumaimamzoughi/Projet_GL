const mongoose = require('mongoose');
const Subject = require('./Subject.model');

// Define the Subject schema
const subjectArchiveSchema = new mongoose.Schema({

  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Subject'
    }
  ],
  
});

// Create the Subject model
const SubjectArchive = mongoose.model('SubjectArchive', subjectArchiveSchema);

module.exports = SubjectArchive;