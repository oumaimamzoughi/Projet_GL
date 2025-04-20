const Subject = require('../models/Subject.model');
const Chapter = require('../models/Chapter.model');
const Section = require('../models/Section.model');
const Competence = require('../models/Competence.model');
const SubjectHistory = require('../models/SubjectHistory.model');

const SubjectModification = require('../models/SubjectModification.model');
const User = require('../models/User.model');
const { sendEmail } = require('../services/emailService');

// Create a new subject
exports.createSubject = async (subjectData) => {
  const newSubject = new Subject(subjectData);
  const chapters = subjectData.chapters || [];

  if (chapters.length > 0) {
    const createdChapters = await Promise.all(chapters.map(async (chapter) => {
      if (chapter._id) {
        const existingChapter = await Chapter.findById(chapter._id);
        if (chapter.sections && chapter.sections.length > 0) {
          const createdSections = await Section.insertMany(chapter.sections);
          existingChapter.sections = createdSections.map(section => section._id);
        }
        return existingChapter;
      } else {
        const newChapter = new Chapter(chapter);
        if (chapter.sections && chapter.sections.length > 0) {
          const createdSections = await Section.insertMany(chapter.sections);
          newChapter.sections = createdSections.map(section => section._id);
        }
        return newChapter.save();
      }
    }));
    newSubject.chapters = createdChapters.map(chapter => chapter._id);
  }

  if (subjectData.competences && subjectData.competences.length > 0) {
    const competenceIds = await Promise.all(subjectData.competences.map(async (competence) => {
      if (competence._id) {
        return competence._id;
      } else {
        const newCompetence = new Competence(competence);
        const savedCompetence = await newCompetence.save();
        return savedCompetence._id;
      }
    }));
    newSubject.competences = competenceIds;
  }

  return await newSubject.save();
};

// Get all subjects
exports.getAllSubjects = async (isAdmin) => {
  if (isAdmin) {
    return await Subject.find({ archive: false })
      .populate({
        path: 'chapters',
        populate: { path: 'sections', select: 'name' },
      })
      .populate({ path: 'competences', select: 'title force' })
      .populate({ path: 'evaluation', select: 'id_evaluation message' });
  } else {
    return await Subject.find({ masked: false });
  }
};

// Get a specific subject by ID
exports.getSubjectById = async (id) => {
  const subject = await Subject.findById(id).populate({
    path: 'chapters',
    populate: { path: 'sections' },
  });

  if (!subject) throw new Error('Subject not found');
  if (subject.archive) throw new Error('Subject archived');

  return subject;
};

// Update a subject by ID
exports.updateSubject = async (id, updates) => {
  const subject = await Subject.findById(id);
  if (!subject) throw new Error('Subject not found');
  if (subject.archive) throw new Error('Subject is archived');

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
    version: subject.version || 1,
  });
  await subjectHistory.save();

  return await Subject.findByIdAndUpdate(id, { ...updates, version: (subject.version || 0) + 1 }, { new: true });
};

// Delete a subject by ID
exports.deleteSubject = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw new Error('Subject not found');
  if (subject.archive) throw new Error('Subject already archived');
  if (!subject.used) {
    await subject.deleteOne();
    return { message: 'Subject deleted successfully' };
  } else {
    subject.archive = true;
    await subject.save();
    return { message: 'Subject archived successfully' };
  }
};

// Toggle subject visibility
exports.toggleSubjectVisibility = async (id, masked) => {
  if (typeof masked !== 'boolean') throw new Error('Invalid value for masked');
  return await Subject.findByIdAndUpdate(id, { masked }, { new: true });
};



// Add modification
exports.addModification = async (modificationData) => {
  const { id_Subject, id_user, raison, proposedChanges } = modificationData;

  const subject = await Subject.findById(id_Subject);
  if (!subject) throw new Error('Subject not found');

  const existingModification = await SubjectModification.findOne({ id_Subject, validated: false });
  if (existingModification) throw new Error('A pending modification already exists for this subject.');

  const modification = new SubjectModification({
    id_Subject,
    id_user,
    raison,
    subject: proposedChanges,
  });
  await modification.save();

  return { message: 'Modification request has been created successfully.', modification };
};

// Get subjects by user
exports.getSubjectsByUser = async (userId) => {
  const user = await User.findById(userId).populate('subjects');
  if (!user) throw new Error('User not found');
  return user.subjects.filter(subject => !subject.masked);
};

// Toggle subject visibility by admin
exports.toggleSubjectVisibilityByAdmin = async (id, masked) => {
  if (typeof masked !== 'boolean') throw new Error('Invalid value for masked');
  return await Subject.findByIdAndUpdate(id, { masked }, { new: true });
};

// Get subject with history
exports.getSubjectWithHistory = async (id) => {
  const subject = await Subject.findById(id);
  if (!subject) throw new Error('Subject not found');

  const subjectHistory = await SubjectHistory.find({ subjectId: subject._id }).sort({ createdAt: -1 });
  return { subject, history: subjectHistory };
};

// Get all modifications
exports.getAllModifications = async () => {
  return await SubjectModification.find().populate('id_user', 'name email');
};

// Update chapter in subject
exports.updateChapterInSubject = async (subjectId, chapterId, status, date) => {
  const subject = await Subject.findById(subjectId).populate('chapters').populate('evaluation');
  if (!subject) throw new Error('Subject not found');

  const chapter = subject.chapters.find(chapter => chapter._id.toString() === chapterId);
  if (!chapter) throw new Error('Chapter not associated with the subject');

  chapter.status = status || 'terminated';
  chapter.date = date || new Date();
  const updatedChapter = await chapter.save();

  const totalChapters = subject.chapters.length;
  const terminatedChapters = subject.chapters.filter(chapter => chapter.status === 'terminated').length;
  const advancementPercentage = Math.round((terminatedChapters / totalChapters) * 100);

  subject.advancement = `${advancementPercentage}%`;
  await Subject.updateOne({ _id: subjectId }, { $set: { advancement: `${advancementPercentage}%` } });

  const usersToNotify = await User.find({
    $or: [
      { role: 'admin' },
      { role: 'student', subjects: subjectId }
    ]
  });

  const emails = usersToNotify.map(user => user.email);
  const emailSubject = 'Mise à jour du chapitre';
  const emailText = `Bonjour,\nNous vous informons que le chapitre "${updatedChapter.title}" du sujet "${subject.title}" a été mis à jour.\nL'avancement de ce sujet est maintenant de ${subject.advancement}.\nMerci de votre attention.\nCordialement,\nL'équipe pédagogique`;
  const emailHtml = `<p>Bonjour,</p><p>Nous vous informons que le chapitre "<strong>${updatedChapter.title}</strong>" du sujet "<strong>${subject.title}</strong>" a été mis à jour.</p><p>L'avancement de ce sujet est maintenant de <strong>${subject.advancement}</strong>.</p><p>Merci de votre attention.</p><p>Cordialement,</p><p>L'équipe pédagogique</p>`;

  await sendEmail({
    to: emails.join(', '),
    subject: emailSubject,
    text: emailText,
    html: emailHtml
  });

  return { message: 'Chapter updated successfully', chapter: updatedChapter, advancement: subject.advancement };
};