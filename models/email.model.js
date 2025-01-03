const mongoose = require('mongoose');

const MailSchema = new mongoose.Schema({
  isModified: { type: Boolean, default: false }, // Indique si la liste a été modifiée
  lastSentDate: { type: Date, default: null },   // Date du dernier envoi
});

module.exports = mongoose.model('Mail', MailSchema);
