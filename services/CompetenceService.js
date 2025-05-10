const Competence = require('../models/Competence.model');
const CompetenceUpdateStrategy = require('../strategies/CompetenceUpdateStrategy');
const UpdaterContext = require('../utils/UpdaterContext');

class CompetenceService {
  constructor() {
    this.updater = new UpdaterContext(new CompetenceUpdateStrategy());
  }

  async createCompetence(competenceData) {
    const competence = new Competence(competenceData);
    return competence.save();
  }

  async getAllCompetences() {
    return Competence.find();
  }

  async getCompetenceById(id) {
    return Competence.findById(id);
  }

  async updateCompetence(id, updateData) {
    const competence = await Competence.findById(id);
    if (!competence) {
      throw new Error('Competence not found');
    }

    this.updater.update(competence, updateData);
    return competence.save();
  }

  async deleteCompetence(id) {
    return Competence.findByIdAndDelete(id);
  }
}

module.exports = new CompetenceService();
