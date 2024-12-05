const baseUserSchema = require('./BaseUserSchema');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  ...baseUserSchema.obj, // Extend the base schema
  permissions: { type: [String], default: ['manage_users', 'manage_content'] },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
