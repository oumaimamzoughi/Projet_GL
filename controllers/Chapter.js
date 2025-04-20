const chapterService = require('../services/ChapterService');
const ChapterUpdateStrategy = require('../strategies/ChapterUpdateStrategy');

module.exports = {
  async createChapter(req, res) {
    try {
      const chapter = await chapterService.createChapter(req.body);
      res.status(201).json(chapter);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getChapter(req, res) {
    try {
      const chapter = await chapterService.getChapterById(req.params.id);
      res.status(200).json(chapter);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateChapter(req, res) {
    try {
      // Injecter la stratégie de mise à jour
      chapterService.setUpdateStrategy(new ChapterUpdateStrategy());

      // Mettre à jour le chapitre en utilisant la stratégie
      const updatedChapter = await chapterService.updateChapter(req.params.id, req.body);
      res.status(200).json(updatedChapter);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteChapter(req, res) {
    try {
      await chapterService.deleteChapter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const chapter = await chapterService.updateChapterStatus(req.params.id, req.body.status);
      res.status(200).json(chapter);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};