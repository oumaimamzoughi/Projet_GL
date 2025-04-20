const UpdateStrategy = require('../utils/UpdateStrategy');

class ChapterUpdateStrategy extends UpdateStrategy {
  update(chapter, newData) {
    chapter.name = newData.name || chapter.name;
    chapter.status = newData.status || chapter.status;

    if (newData.date) {
      chapter.date = newData.date;
    }

    if (newData.sections && newData.sections.length > 0) {
      chapter.sections = newData.sections.map(section => section._id || section);
    }
  }
}

module.exports = ChapterUpdateStrategy;