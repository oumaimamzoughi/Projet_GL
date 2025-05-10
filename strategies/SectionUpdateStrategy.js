const UpdateStrategy = require('../utils/UpdateStrategy');

class SectionUpdateStrategy extends UpdateStrategy {
  update(section, newData) {
    section.name = newData.name || section.name;
    section.content = newData.content || section.content;
    section.status = newData.status || section.status;

    if (newData.additionalField) {
      section.additionalField = newData.additionalField;
    }
  }
}

module.exports = SectionUpdateStrategy;
