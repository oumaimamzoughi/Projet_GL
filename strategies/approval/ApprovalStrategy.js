// strategies/approval/ApprovalStrategy.js
class ApprovalStrategy {
    async execute(modification, subject) {
      throw new Error('approve() must be implemented by subclass');
    }
  }
  
  module.exports = ApprovalStrategy;