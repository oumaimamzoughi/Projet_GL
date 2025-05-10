class UpdaterContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  update(entity, newData) {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    this.strategy.update(entity, newData);
  }
}

module.exports = UpdaterContext;
