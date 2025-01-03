const mongoose = require('mongoose');

// Define the Subject schema
const subjectHistorySchema = new mongoose.Schema({
  id_Subject: {
    type: Number, 
    required: true,
    unique: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Subject'
    }
  ],
  
});

// Create the Subject model
const SubjectHistory = mongoose.model('SubjectHistory', subjectHistorySchema);

module.exports = SubjectHistory;