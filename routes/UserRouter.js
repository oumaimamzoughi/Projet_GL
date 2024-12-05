const express = require('express');
const router = express.Router();
const{
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}= require('../controllers/User')

// Route to create a new user
router.post('/users', createUser);

// Route to get all users
router.get('/users', getAllUsers);

// Route to get a specific user by ID
router.get('/users/:id', getUserById);

// Route to update a user by ID
router.put('/users/:id', updateUser);

// Route to delete a user by ID
router.delete('/users/:id', deleteUser);

module.exports = router;
