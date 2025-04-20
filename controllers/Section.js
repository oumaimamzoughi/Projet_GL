// controllers/sectionController.js
const SectionService = require('../services/SectionService');
const SectionUpdateStrategy = require('../strategies/SectionUpdateStrategy');

module.exports = {
  async createSection(req, res) {
    try {
      const newSection = await SectionService.createSection(req.body);
      res.status(201).json(newSection);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAllSections(req, res) {
    try {
      const sections = await SectionService.getAllSections();
      res.status(200).json(sections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSectionById(req, res) {
    try {
      const section = await SectionService.getSectionById(req.params.id);
      res.status(200).json(section);
    } catch (error) {
      if (error.message === 'Section not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async updateSection(req, res) {
    try {
      // Injecter la stratégie de mise à jour
      SectionService.setUpdateStrategy(new SectionUpdateStrategy());

      // Mettre à jour la section en utilisant la stratégie
      const updatedSection = await SectionService.updateSection(req.params.id, req.body);
      res.status(200).json(updatedSection);
    } catch (error) {
      if (error.message === 'Section not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  async deleteSection(req, res) {
    try {
      await SectionService.deleteSection(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Section not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
};