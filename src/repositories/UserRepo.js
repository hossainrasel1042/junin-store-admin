import { User } from "@/models/EntryModel.js";

class UserRepository {
  safeAttributes = { exclude: ["password_hash"] };

  async findAll() {
    return User.findAll({ attributes: this.safeAttributes });
  }

  async findById(id) {
    return User.findByPk(id, { attributes: this.safeAttributes });
  }

  async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  async create(data) {
    const user = await User.create(data);
    const userJson = user.toJSON();
    delete userJson.password_hash;
    return userJson;
  }

  async update(id, data) {
    await User.update(data, { where: { id } });
    return this.findById(id);
  }

  async softDelete(id) {
    await User.destroy({ where: { id } });
  }
}

export const userRepository = new UserRepository();
