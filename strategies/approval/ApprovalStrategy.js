// strategies/approval/ApprovalStrategy.js
class ApprovalStrategy {
    async approve(modification, subject) {
      throw new Error('approve() must be implemented by subclass');
    }
  }
  
  module.exports = ApprovalStrategy;