const User = require('../models/User.model');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { role, ...userData } = req.body;

    // Ensure a valid role is provided if using discriminators
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Use the correct discriminator model based on the role
    const userModel = User.discriminators[role] || User;
    const newUser = new userModel(userData);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const { role, ...updateData } = req.body;

    // Prevent updating the role dynamically
    if (role) {
      return res.status(400).json({ error: 'Role update is not allowed' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send(); // No content response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get users by role (optional utility function)
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const users = await User.find({ role });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
