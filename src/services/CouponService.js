import { couponRepository } from "@/repositories/CouponRepo.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "@/validations/CouponSchema.js";

class AddCoupon {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(couponData) {
    const validatedData = createCouponSchema.parse(couponData);
    const existingCoupon = await this.repository.findByCode(validatedData.code);
    if (existingCoupon) throw new Error("Coupon code already exists");
    return this.repository.create(validatedData);
  }
}

class UpdateCoupon {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(id, updateData) {
    const existingCoupon = await this.repository.findById(id);
    if (!existingCoupon) throw new Error("Coupon not found");
    const validatedData = updateCouponSchema.parse(updateData);
    if (validatedData.code && validatedData.code !== existingCoupon.code) {
      const duplicateCoupon = await this.repository.findByCode(
        validatedData.code,
      );
      if (duplicateCoupon) throw new Error("Coupon code already exists");
    }
    return this.repository.update(id, validatedData);
  }
}

class DeleteCoupon {
  constructor(repository) {
    this.repository = repository;
  }
  async execute(id) {
    const existingCoupon = await this.repository.findById(id);
    if (!existingCoupon) throw new Error("Coupon not found");
    await this.repository.delete(id);
    return { message: "Coupon deleted successfully", id };
  }
}

class CouponService {
  constructor() {
    this._addCoupon = new AddCoupon(couponRepository);
    this._updateCoupon = new UpdateCoupon(couponRepository);
    this._deleteCoupon = new DeleteCoupon(couponRepository);
  }

  async createCoupon(data) {
    return this._addCoupon.execute(data);
  }
  async updateCoupon(id, updateData) {
    return this._updateCoupon.execute(id, updateData);
  }
  async deleteCoupon(id) {
    return this._deleteCoupon.execute(id);
  }

  async getAllCoupons({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const result = await couponRepository.findAndCountAll({ limit, offset });
    return { total: result.count, page, limit, coupons: result.rows };
  }

  async getCouponById(id) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new Error("Coupon not found");
    return coupon;
  }
}

export const couponService = new CouponService();
