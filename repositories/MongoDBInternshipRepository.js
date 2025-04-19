const InternshipModel = require("../models/InternshipModel");
const IInternshipRepository = require("../interfaces/IInternshipRepository");

class MongoDBInternshipRepository extends IInternshipRepository {
  async create(data) {
    const internship = new InternshipModel(data);
    return await internship.save();
  }

  async findById(id) {
    return await InternshipModel.findById(id).populate('studentId teacherId');
  }

  async findAll(filter = {}) {
    return await InternshipModel.find(filter).populate('studentId teacherId');
  }

  async update(id, data) {
    return await InternshipModel.findByIdAndUpdate(id, data, { new: true }).populate('studentId teacherId');
  }

  async delete(id) {
    return await InternshipModel.findByIdAndDelete(id);
  }

  async findByType(type) {
    return await InternshipModel.find({ type }).populate('studentId teacherId');
  }

  async assignTeacher(internshipId, teacherId) {
    return await InternshipModel.findByIdAndUpdate(
      internshipId,
      { teacherId, status: 'ASSIGNED' },
      { new: true }
    ).populate('studentId teacherId');
  }
}

module.exports = MongoDBInternshipRepository;