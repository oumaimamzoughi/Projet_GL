const Subject = require('../models/Subject.model');
const User = require('../models/User.model');
const Chapter = require('../models/Chapter.model')
const Section= require('../models/Section.model');
const Competence = require('../models/Competence.model')
// Create a new subject
exports.createSubject = async (req, res) => {
  try {
    // Step 1: Create a new subject
    const newSubject = new Subject(req.body);

    // Step 2: Create chapters and associate them with the subject
    const chapters = req.body.chapters || []; // Get chapters data from the request body

    if (chapters.length > 0) {
      const createdChapters = await Promise.all(chapters.map(async (chapter) => {
        if (chapter._id) {
          // If the chapter has an _id, it's an existing chapter, so we only need to update it with sections
          const existingChapter = await Chapter.findById(chapter._id);
          if (chapter.sections && chapter.sections.length > 0) {
            // Create sections within the existing chapter
            const createdSections = await Section.insertMany(chapter.sections);
            existingChapter.sections = createdSections.map(section => section._id); // Assign created section ids to the chapter
          }
          return existingChapter; // Return the existing chapter with its updated sections
        } else {
          // If the chapter doesn't have an _id, create a new chapter
          const newChapter = new Chapter(chapter);
          if (chapter.sections && chapter.sections.length > 0) {
            // Create sections within the new chapter
            const createdSections = await Section.insertMany(chapter.sections);
            newChapter.sections = createdSections.map(section => section._id); // Assign created section ids to the chapter
          }
          return newChapter.save(); // Save the new chapter and return it
        }
      }));

      if (req.body.competences && req.body.competences.length > 0) {
        const competenceIds = await Promise.all(req.body.competences.map(async (competence) => {
          if (competence._id) {
            // If competence has _id, it's an existing competence, so just use the _id
            return competence._id;
          } else {
            // If competence doesn't have _id, create a new competence
            const newCompetence = new Competence(competence);
            const savedCompetence = await newCompetence.save();
            return savedCompetence._id;
          }
        }));
  
        newSubject.competences = competenceIds; // Assign competence ids to the subject
      }

      newSubject.chapters = createdChapters.map(chapter => chapter._id); // Assign created chapter ids to the subject
    }

    // Step 3: Save the subject with the associated chapters and sections
    await newSubject.save();

    // Step 4: Return the created subject along with its chapters and sections
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
      subjects = await Subject.find({ archive: false }).populate({
        path: 'chapters', // Populate the 'chapters' field
        populate: {
          path: 'sections', // Nested populate to get 'sections' inside chapters
          select: 'name' // Optionally select the fields to be populated
        }
      })
      .populate({
        path: 'competences', // Populate competences
        select: 'title force' // Optionally select the fields to be populated
      })
      .populate({
        path: 'evaluation', // Populate the evaluation field
        select: 'id_evaluation message' // Select the evaluation fields
      });;
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
    const subject = await Subject.findById(req.params.id).populate({
        path: 'chapters', // Populate chapters
        populate: {
          path: 'sections', // Nested populate sections inside chapters
        },
      });
    if (!subject ) {
      return res.status(404).json({ message: 'Subject not found' });

    }else if (subject.archive){
      return res.status(404).json({ message: 'Subject archived ' });

    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject by ID
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }else if (subject.archive){
      return res.status(404).json({ message: 'Subject archived ' });
    }else {
      subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject by ID
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }else if (subject.archive){
      return res.status(404).json({ message: 'Subject already archived ' });

    }else if (!subject.used){
      await subject.deleteOne();
      return res.status(200).json({ message: 'Subject deleted successfully' });
    }else {
      subject.archive = true;
      await subject.save();
      return res.status(200).json({ message: 'Subject archived successfully' }); 
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