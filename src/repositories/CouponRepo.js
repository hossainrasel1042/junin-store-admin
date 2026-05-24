import { Coupon, User } from "@/models/EntryModel.js";

class CouponRepository {
  async findAll() {
    return Coupon.findAll({
      include: [{ model: User, as: "creator", attributes: ["id", "email"] }],
    });
  }

  async findAndCountAll({ limit, offset }) {
    return Coupon.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "creator", attributes: ["id", "email"] }],
    });
  }

  async findById(id) {
    return Coupon.findByPk(id);
  }

  async findByCode(code) {
    return Coupon.findOne({ where: { code } });
  }

  async create(data) {
    return Coupon.create(data);
  }

  async update(id, data) {
    await Coupon.update(data, { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    return Coupon.destroy({ where: { id } });
  }
}

export const couponRepository = new CouponRepository();
