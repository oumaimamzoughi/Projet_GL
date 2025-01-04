const Subject = require('../models/Subject.model');
const User = require('../models/User.model');
const Chapter = require('../models/Chapter.model')
const Section= require('../models/Section.model');
const Competence = require('../models/Competence.model')
const SubjectHistory = require('../models/SubjectHistory.model'); 
const SubjectModification = require('../models/SubjectModification.model')
const { sendEmail }= require('../services/emailService')
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
    // Step 1: Find the existing subject
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Step 2: Check if the subject is archived
    if (subject.archive) {
      return res.status(404).json({ message: 'Subject is archived' });
    }

    // Step 3: Create a history entry for the current subject state before the update
    // Clone the entire subject object (including chapters, sections, competences, etc.)
    const subjectHistory = new SubjectHistory({
      subjectId: subject._id,
      title: subject.title,
      description: subject.description,
      nb_hour: subject.nb_hour,
      semester: subject.semester,
      level: subject.level,
      archived: subject.archive,
      archivedAt: subject.archivedAt, // If archived, we store this as well
      competences: subject.competences,  // Store all related competences
      chapters: subject.chapters,  // Store all related chapters
      sections: subject.sections,  // Store all related sections
      evaluation: subject.evaluation,  // Store evaluation data
      advancement: subject.advancement,  // Store advancement data
      version: subject.version || 1,  // Get the current version, default to 1 if not set
    });

    // Save the history record
    await subjectHistory.save();

    // Step 4: Update the subject with the new data from the request body
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: (subject.version || 0) + 1 }, // Increment the version for the new subject
      { new: true } // Return the updated subject
    );

    // Step 5: Return the updated subject
    res.status(200).json(updatedSubject);
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

exports.getSubjectWithHistory = async (req, res) => {
  try {
    // Retrieve the subject by its ID
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Retrieve the history for the subject based on the subject ID
    const subjectHistory = await SubjectHistory.find({ subjectId: subject._id })
      .sort({ createdAt: -1 }) // Sort the history by creation date, latest first
      .exec();

    // Return the subject along with its history
    res.status(200).json({
      subject: subject,
      history: subjectHistory,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllModifications = async (req, res) => {
  try {
    console.log("Fetching all modifications...");
    
    // Fetch all modifications from the SubjectModification collection
    const modifications = await SubjectModification.find()
      .populate('id_user', 'name email') // Populate user details (e.g., name and email) if needed
      .exec();

    // Return the fetched modifications
    res.status(200).json(modifications);
  } catch (error) {
    console.error("Error fetching modifications:", error.message);
    res.status(500).json({ error: "Failed to fetch modifications. Please try again." });
  }
};

exports.approveModification = async (req, res) => {
  console.log("heelooo");
  try {
    const modificationId = req.params.id;

    // Find the modification
    const modification = await SubjectModification.findById(modificationId).populate('id_user');
    if (!modification) {
      return res.status(404).json({ message: 'Modification not found' });
    }

    // Find the subject to update
    const subject = await Subject.findById(modification.id_Subject);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Archive the current version in SubjectHistory
    const subjectHistory = new SubjectHistory({
      subjectId: subject._id,
      title: subject.title,
      description: subject.description,
      nb_hour: subject.nb_hour,
      semester: subject.semester,
      level: subject.level,
      archived: subject.archive,
      archivedAt: subject.archivedAt,
      competences: subject.competences,
      chapters: subject.chapters,
      sections: subject.sections,
      evaluation: subject.evaluation,
      advancement: subject.advancement,
      version: (subject.version || 1), // Default to 1 if not set
    });
    await subjectHistory.save();

    // Prepare the update data by excluding _id
    const { _id, ...updatedSubjectData } = modification.subject.toObject();

    // Update the subject with the proposed changes
    await Subject.findByIdAndUpdate(subject._id, updatedSubjectData, { new: true });

    // Mark the modification as validated
    modification.validated = true;
    await modification.save();

    // Notify the user who proposed the modification
    await sendEmail({
      to: modification.id_user.email,
      subject:'Modification Approved',
      text:`Your proposed modification to the subject "${subject.title}" has been approved.`,
      html: `<p>Your proposed modification to the subject "${subject.title}" has been approved.</p>`,
    });

    res.status(200).json({ message: 'Modification approved and subject updated successfully.' });
  } catch (error) {
    console.error("Error approving modification:", error);
    res.status(400).json({ error: error.message });
  }
};


exports.addModification = async (req, res) => {
  try {
    const { id_Subject, id_user, raison, proposedChanges } = req.body;

    // Validate the subject exists
    const subject = await Subject.findById(id_Subject);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if there's already a pending modification for the subject
    const existingModification = await SubjectModification.findOne({ id_Subject, validated: false });
    if (existingModification) {
      return res.status(400).json({ message: 'A pending modification already exists for this subject.' });
    }

    // Create a new modification entry
    const modification = new SubjectModification({
      id_Subject,
      id_user,
      raison,
      subject: proposedChanges, // Proposed changes to the subject
    });

    await modification.save();

    res.status(201).json({
      message: 'Modification request has been created successfully.',
      modification,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};