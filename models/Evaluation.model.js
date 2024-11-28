const mongoose = require('mongoose');


const evaluationSchema = new mongoose.Schema({
  id_evaluation: String,
  message: String,       
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

module.exports = Evaluation;
