const baseUserSchema = require('./BaseUserSchema');
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  ...baseUserSchema.obj, // Extend the base schema
  class: { type: String, required: true },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
],
year:{
    type: String,
    required: true,
}
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
