const UserModel = require("../models/UserModel");
const IUserRepository = require("../interfaces/IUserRepository");

class MongoDBUserRepository extends IUserRepository {
  async findById(id) {
    return await UserModel.findById(id);
  }

  async save(user) {
    return await user.save();
  }

  async findByRole(role) {
    return await UserModel.find({ role });
  }

  async findTeachers() {
    return await this.findByRole('teacher');
  }
}

module.exports = MongoDBUserRepository;