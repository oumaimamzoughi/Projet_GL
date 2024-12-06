const baseUserSchema = require('./BaseUserSchema');
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  ...baseUserSchema.obj, // Extend the base schema
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  ],
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
