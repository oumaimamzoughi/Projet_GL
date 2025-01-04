const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  id_sender: { type: String, required: true },   
  message: { type: String, required: true },       
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }, 
  teachers: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Teacher', 
      required: true 
    }
  ],
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
