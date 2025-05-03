const { PfaBinome, PfaMonome } = require("../models/PFA.model");

class PFAFactory {
  createPFA(data) {
    throw new Error("This method must be overridden by subclasses!");
  }
}

class BinomePFAFactory extends PFAFactory {
  createPFA(data) {
    const { title, description, technologies, partner_id, teacher } = data;
    return new PfaBinome({
      title,
      description,
      technologies,
      partner_id, // Obligatoire pour PfaBinome
      teacher,
      status: "ongoing",
      state: "non affecté",
    });
  }
}

class MonomePFAFactory extends PFAFactory {
  createPFA(data) {
    const { title, description, technologies, teacher } = data;
    return new PfaMonome({
      title,
      description,
      technologies,
      teacher,
      status: "ongoing",
      state: "non affecté",
    });
  }
}

module.exports = { PFAFactory, BinomePFAFactory, MonomePFAFactory };