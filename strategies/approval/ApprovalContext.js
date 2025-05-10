class ApprovalContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async execute(modification, subject) {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    return this.strategy.execute(modification, subject);
  }
}

module.exports = ApprovalContext;
