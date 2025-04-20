// controllers/competenceController.js
const competenceService = require('../services/CompetenceService');
const CompetenceUpdateStrategy = require('../strategies/CompetenceUpdateStrategy');

module.exports = {
  async createCompetence(req, res) {
    try {
      const competence = await competenceService.createCompetence(req.body);
      res.status(201).json(competence);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllCompetences(req, res) {
    try {
      const competences = await competenceService.getAllCompetences();
      res.status(200).json(competences);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCompetence(req, res) {
    try {
      const competence = await competenceService.getCompetenceById(req.params.id);
      res.status(200).json(competence);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCompetence(req, res) {
    try {
      // Injecter la stratégie de mise à jour
      competenceService.setUpdateStrategy(new CompetenceUpdateStrategy());

      // Mettre à jour la compétence en utilisant la stratégie
      const updatedCompetence = await competenceService.updateCompetence(req.params.id, req.body);
      res.status(200).json(updatedCompetence);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCompetence(req, res) {
    try {
      await competenceService.deleteCompetence(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};