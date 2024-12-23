const Subject = require('../models/Subject.model');
const User = require('../models/User.model');
// Create a new subject
exports.createSubject = async (req, res) => {
  try {
    const newSubject = new Subject(req.body);
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'; // Check if the user is admin
    let subjects;

    if (isAdmin  || true) {
      // Admin can see all subjects
      subjects = await Subject.find();
    } else {
      // Non-admins (teachers, students) see only non-masked subjects
      subjects = await Subject.find({ masked: false });
    }

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject by ID
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hide or unhide a subject by ID
exports.toggleSubjectVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { masked } = req.body;

    if (typeof masked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for masked. It must be a boolean.' });
    }

    const subject = await Subject.findByIdAndUpdate(id, { masked }, { new: true });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get subjects by Student or Teacher
exports.getSubjectsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('subjects');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out masked subjects for non-admins
    const visibleSubjects = user.subjects.filter(subject => !subject.masked);
    res.status(200).json(visibleSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hide or unhide a subject by ID by Admin
exports.toggleSubjectVisibilityByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { masked } = req.body;

    if (typeof masked !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for masked. It must be a boolean.' });
    }

    // Check if the current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change visibility' });
    }

    const subject = await Subject.findByIdAndUpdate(id, { masked }, { new: true });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};