const express = require('express');
const router = express.Router();
const{
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateSubjectAdvancement,
}= require('../controllers/User')

// Route to create a new user
router.post('/', createUser);

// Route to get all users
router.get('/', getAllUsers);

// Route to get a specific user by ID
router.get('/:id', getUserById);

//update advancement for teacher 
router.put('/update-advancement', updateSubjectAdvancement);

// Route to update a user by ID
router.put('/:id', updateUser);

// Route to delete a user by ID
router.delete('/:id', deleteUser);

module.exports = router;
