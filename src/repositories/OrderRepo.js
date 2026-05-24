import { Order, Coupon, User } from "@/models/EntryModel.js";

const defaultIncludes = [
  {
    model: Coupon,
    as: "coupon",
    attributes: ["id", "code", "discount_type", "discount_value"],
  },
  {
    model: User,
    as: "approver",
    attributes: ["id", "email"],
  },
];

class OrderRepository {
  async findAndCountAll({ limit = 20, offset = 0, status } = {}) {
    const where = {};
    if (status) where.status = status;

    return Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: defaultIncludes,
    });
  }

  async findById(id) {
    return Order.findByPk(id, { include: defaultIncludes });
  }

  async findByOrderId(order_id) {
    return Order.findOne({ where: { order_id }, include: defaultIncludes });
  }
  async findByIdempotencyKey(idempotency_key) {
    return Order.findOne({ where: { idempotency_key } });
  }
  async delete(id) {
    return Order.destroy({ where: { id } });
  }
  // ── Mutations ────────────────────────────────────────────────────────
  async create(data) {
    return Order.create(data);
  }
  async findByPhone(user_phone) {
    return Order.findAll({
      where: { user_phone },
      order: [["created_at", "DESC"]],
      include: defaultIncludes,
    });
  }

  async updateStatus(id, status, approved_by = null) {
    const updateData = { status };
    if (approved_by) updateData.approved_by = approved_by;

    await Order.update(updateData, { where: { id } });
    return this.findById(id);
  }
}

export const orderRepository = new OrderRepository();
