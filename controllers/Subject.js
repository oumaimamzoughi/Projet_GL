const SubjectService = require('../services/SubjectService');
const ApprovalService = require('../services/ApprovalService');


// Create a new subject
exports.createSubject = async (req, res) => {
  try {
    const newSubject = await SubjectService.createSubject(req.body);
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const subjects = await SubjectService.getAllSubjects(isAdmin);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await SubjectService.getSubjectById(req.params.id);
    res.status(200).json(subject);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update a subject by ID
exports.updateSubject = async (req, res) => {
  try {
    const updatedSubject = await SubjectService.updateSubject(req.params.id, req.body);
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  try {
    const result = await SubjectService.deleteSubject(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Toggle subject visibility
exports.toggleSubjectVisibility = async (req, res) => {
  try {
    const subject = await SubjectService.toggleSubjectVisibility(req.params.id, req.body.masked);
    res.status(200).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get subjects by user
exports.getSubjectsByUser = async (req, res) => {
  try {
    const subjects = await SubjectService.getSubjectsByUser(req.params.userId);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Toggle subject visibility by admin
exports.toggleSubjectVisibilityByAdmin = async (req, res) => {
  try {
    const subject = await SubjectService.toggleSubjectVisibilityByAdmin(req.params.id, req.body.masked);
    res.status(200).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get subject with history
exports.getSubjectWithHistory = async (req, res) => {
  try {
    const result = await SubjectService.getSubjectWithHistory(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Get all modifications
exports.getAllModifications = async (req, res) => {
  try {
    const modifications = await SubjectService.getAllModifications();
    res.status(200).json(modifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveModification = async (req, res) => {
  try {
    const { id } = req.params; // Important: utiliser 'id' pour correspondre à la route
    
    const approvalService = new ApprovalService();
    const result = await approvalService.approve(id);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('[Approval Error]', error);
    res.status(400).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Add modification
exports.addModification = async (req, res) => {
  try {
    const result = await SubjectService.addModification(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update chapter in subject
exports.updateChapterInSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { chapterId, status, date } = req.body;
    const result = await SubjectService.updateChapterInSubject(subjectId, chapterId, status, date);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};