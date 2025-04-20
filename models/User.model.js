const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  cin: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (value) => value.length === 8,
      message: 'CIN must be exactly 8 characters long',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email'],
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'admin', 'teacher'],
    default: 'student',
  },
  situation: { type: String, required: true },
  password: { type: String, required: true },
  graduationDate: { type: Date },
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      validate: {
        validator: function (value) {
          return this.role !== 'admin'; // Vérifie qu'un admin n'a pas de matières associées
        },
        message: 'Admin users cannot have associated subjects',
      },
    },
  ],
  class: {
    type: String,
    required: function () {
      return this.role === 'student'; // Un étudiant doit avoir une classe
    },
  },
  year: { type: String },
}, {
  timestamps: true,
});

const User = mongoose.model('User', UserSchema);

module.exports = User;