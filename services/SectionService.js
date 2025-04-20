const Section = require('../models/Section.model');
const SectionUpdateStrategy = require('../strategies/SectionUpdateStrategy');
const UpdaterContext = require('../utils/UpdaterContext');

class SectionService {
  constructor() {
    this.updater = new UpdaterContext(new SectionUpdateStrategy());
  }

  setUpdateStrategy(strategy) {
    this.updater.setStrategy(strategy);
  }

  async createSection(data) {
    return new Section(data).save();
  }

  async getAllSections() {
    return Section.find();
  }

  async getSectionById(id) {
    const section = await Section.findById(id);
    if (!section) throw new Error('Section not found');
    return section;
  }

  async updateSection(id, updateData) {
    const section = await Section.findById(id);
    if (!section) throw new Error('Section not found');

    this.updater.update(section, updateData);
    return section.save();
  }

  async deleteSection(id) {
    return Section.findByIdAndDelete(id);
  }
}

module.exports = new SectionService();