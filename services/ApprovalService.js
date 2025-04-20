const SubjectModification = require('../models/SubjectModification.model');
const Subject = require('../models/Subject.model');
const DefaultApprovalStrategy = require('../strategies/approval/DefaultApprovalStrategy');

class ApprovalService {
  constructor(strategy = new DefaultApprovalStrategy()) {
    this.strategy = strategy;
  }

  async approve(modificationId) {
    const modification = await SubjectModification.findById(modificationId).populate('id_user');
    if (!modification) throw new Error('Modification not found');

    const subject = await Subject.findById(modification.id_Subject);
    if (!subject) throw new Error('Subject not found');

    return this.strategy.execute(modification, subject);
  }
}

module.exports = ApprovalService;