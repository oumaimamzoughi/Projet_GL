const SubjectHistory = require('../../models/SubjectHistory.model');
const Subject = require('../../models/Subject.model');
const { sendEmail } = require('../../services/emailService');

class DefaultApprovalStrategy {
  async execute(modification, subject) {
    await this.createHistory(subject);
    await this.updateSubject(subject, modification);
    await this.markAsValidated(modification);
    await this.notifyUser(modification, subject);

    return {
      success: true,
      message: 'Modification approved and subject updated successfully'
    };
  }

  async createHistory(subject) {
    const history = new SubjectHistory({
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
      version: subject.version || 1
    });
    await history.save();
  }

  async updateSubject(subject, modification) {
    const { _id, ...updates } = modification.subject.toObject();
    await Subject.findByIdAndUpdate(subject._id, {
      ...updates,
      version: (subject.version || 0) + 1
    }, { new: true });
  }

  async markAsValidated(modification) {
    modification.validated = true;
    modification.validatedAt = new Date();
    await modification.save();
  }

  async notifyUser(modification, subject) {
    await sendEmail({
      to: modification.id_user.email,
      subject: 'Modification Approved',
      text: `Your proposed modification to "${subject.title}" has been approved`,
      html: `<p>Your proposed modification to <strong>"${subject.title}"</strong> has been approved.</p>`
    });
  }
}

module.exports = DefaultApprovalStrategy;