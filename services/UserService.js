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

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Appliquer les mises à jour
    Object.assign(user, updateData);

    // Validation supplémentaire pour les admins
    if (user.role === 'admin' && user.subjects.length > 0) {
      throw new Error('Admin users cannot have associated subjects');
    }

    return await user.save();
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