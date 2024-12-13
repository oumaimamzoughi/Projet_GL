const express = require('express');
const router = express.Router();
const {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    toggleSubjectVisibility,
    getSubjectsByUser,
    toggleSubjectVisibilityByAdmin,
} = require("../controllers/Subject")
// Create a new subject
router.post('/', createSubject);

// Get all subjects
router.get('/', getAllSubjects);

// Get a specific subject by ID
router.get('/:id', getSubjectById);

// Update a subject by ID
router.put('/:id', updateSubject);

// Delete a subject by ID
router.delete('/:id', deleteSubject);

// Hide or unhide a subject by ID
router.put('/visibility/:id', toggleSubjectVisibility);

//get subjects by Student or Teacher
router.get('/user/:id', getSubjectsByUser);

// Hide or unhide a subject by ID by Admin
router.put('/visibilityByAdmin/:id', toggleSubjectVisibilityByAdmin);

module.exports = router;