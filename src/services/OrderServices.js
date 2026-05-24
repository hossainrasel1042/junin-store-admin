import { orderRepository } from "@/repositories/OrderRepo.js";
import { couponRepository } from "@/repositories/CouponRepo.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "@/validations/OrderSchema.js";
function calcItemTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.item_total), 0);
}
function applyDiscount(total, coupon) {
  if (!coupon) return 0;

  if (coupon.discount_type === "percentage") {
    return parseFloat(
      ((total * Number(coupon.discount_value)) / 100).toFixed(2),
    );
  }

  return Math.min(Number(coupon.discount_value), total);
}

class CreateOrder {
  constructor(orderRepo, couponRepo) {
    this.orderRepo = orderRepo;
    this.couponRepo = couponRepo;
  }

  async execute(orderData) {
    const validatedData = createOrderSchema.parse(orderData);

    const existing = await this.orderRepo.findByIdempotencyKey(
      validatedData.idempotency_key,
    );
    if (existing) return existing;

    let coupon = null;
    let coupon_id = null;
    let discount_amount = 0;

    if (validatedData.coupon_code) {
      coupon = await this.couponRepo.findByCode(validatedData.coupon_code);
      if (!coupon) throw new Error("Invalid coupon code");

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error("Coupon has expired");
      }

      coupon_id = coupon.id;
    }

    const total_price = parseFloat(
      calcItemTotal(validatedData.user_ordered).toFixed(2),
    );
    discount_amount = parseFloat(applyDiscount(total_price, coupon).toFixed(2));
    const total_payment = parseFloat(
      (total_price - discount_amount).toFixed(2),
    );

    const payload = {
      user_name: validatedData.user_name,
      user_phone: validatedData.user_phone,
      user_city: validatedData.user_city,
      user_address: validatedData.user_address,
      user_ordered: validatedData.user_ordered,
      idempotency_key: validatedData.idempotency_key,
      total_price,
      coupon_id,
      discount_amount,
      total_payment,
    };

    return this.orderRepo.create(payload);
  }
}

class UpdateOrderStatus {
  constructor(orderRepo) {
    this.orderRepo = orderRepo;
  }

  async execute(id, status, approved_by = null) {
    updateOrderStatusSchema.parse({ status });

    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Order not found");

    return this.orderRepo.updateStatus(id, status, approved_by);
  }
}

class DeleteOrder {
  constructor(orderRepo) {
    this.orderRepo = orderRepo;
  }

  async execute(id) {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Order not found");
    await this.orderRepo.delete(id);
    return { message: "Order deleted successfully", id };
  }
}

class OrderService {
  constructor() {
    this._createOrder = new CreateOrder(orderRepository, couponRepository);
    this._updateOrderStatus = new UpdateOrderStatus(orderRepository);
    this._deleteOrder = new DeleteOrder(orderRepository);
  }

  async createOrder(data) {
    return this._createOrder.execute(data);
  }

  async updateOrderStatus(id, status, approved_by = null) {
    return this._updateOrderStatus.execute(id, status, approved_by);
  }

  async deleteOrder(id) {
    return this._deleteOrder.execute(id);
  }

  async getAllOrders({ page = 1, limit = 20, status } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await orderRepository.findAndCountAll({
      limit,
      offset,
      status,
    });
    return { total: count, page, limit, orders: rows };
  }

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) throw new Error("Order not found");
    return order;
  }

  async getOrderByOrderId(order_id) {
    const order = await orderRepository.findByOrderId(order_id);
    if (!order) throw new Error("Order not found");
    return order;
  }

  async getOrdersByPhone(user_phone) {
    const orders = await orderRepository.findByPhone(user_phone);
    if (!orders.length)
      throw new Error("No orders found for this phone number");
    return orders;
  }
}

export const orderService = new OrderService();
