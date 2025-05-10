const SubjectModification = require('../models/SubjectModification.model');
const Subject = require('../models/Subject.model');
const DefaultApprovalStrategy = require('../strategies/approval/DefaultApprovalStrategy');
const ApprovalContext = require('../utils/ApprovalContext');

class ApprovalService {
  constructor() {
    this.approvalContext = new ApprovalContext(new DefaultApprovalStrategy());
  }

  setApprovalStrategy(strategy) {
    this.approvalContext.setStrategy(strategy);
  }

  async approve(modificationId) {
    const modification = await SubjectModification.findById(modificationId).populate('id_user');
    if (!modification) throw new Error('Modification not found');

    const subject = await Subject.findById(modification.id_Subject);
    if (!subject) throw new Error('Subject not found');

    return this.approvalContext.execute(modification, subject);
  }
}

module.exports = new ApprovalService();
