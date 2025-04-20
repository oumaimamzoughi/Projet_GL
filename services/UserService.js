// services/UserService.js
const User = require('../models/User.model');

class UserService {
  static async createUser(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }

  static async getAllUsers() {
    return await User.find();
  }

  static async getUserById(userId) {
    return await User.findById(userId);
  }

  static async updateUser(userId, updateData) {
    if (updateData.role) {
      throw new Error('Role update is not allowed');
    }
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  static async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  static async getUsersByRole(role) {
    if (!['student', 'teacher', 'admin'].includes(role)) {
      throw new Error('Invalid role specified');
    }
    return await User.find({ role });
  }

  static async findUsersByClassAndRole(classId, role) {
    return await User.find({ class: classId, role });
  }
}

module.exports = UserService;