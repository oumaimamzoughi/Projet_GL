const Chapter = require('../models/Chapter.model');
const ChapterUpdateStrategy = require('../strategies/ChapterUpdateStrategy');
const UpdaterContext = require('../utils/UpdaterContext');

class ChapterService {
  constructor() {
    this.updater = new UpdaterContext(new ChapterUpdateStrategy());
  }

  setUpdateStrategy(strategy) {
    this.updater.setStrategy(strategy);
  }

  async createChapter(data) {
    return new Chapter(data).save();
  }

  async getChapterById(id) {
    return Chapter.findById(id).populate('sections');
  }

  async updateChapter(id, updateData) {
    const chapter = await Chapter.findById(id);
    if (!chapter) throw new Error('Chapter not found');

    this.updater.update(chapter, updateData);
    return chapter.save();
  }

  async deleteChapter(id) {
    return Chapter.findByIdAndDelete(id);
  }

  async updateChapterStatus(id, status) {
    return Chapter.findByIdAndUpdate(id, { status }, { new: true });
  }
}

module.exports = new ChapterService();