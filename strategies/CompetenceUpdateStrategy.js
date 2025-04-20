const UpdateStrategy = require('../utils/UpdateStrategy');

class CompetenceUpdateStrategy extends UpdateStrategy {
  update(competence, newData) {
    competence.title = newData.title || competence.title;
    competence.force = newData.force !== undefined ? newData.force : competence.force;

    if (newData.description) {
      competence.description = newData.description;
    }
  }
}

module.exports = CompetenceUpdateStrategy;