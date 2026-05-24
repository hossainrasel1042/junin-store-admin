import { couponService } from "@/services/CouponService.js";
import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { requirePermission } from "@/middleware/UserPermission.js";

export const POST = requirePermission(
  "coupon",
  "w",
  async (req, context, currentUser) => {
    try {
      const body = await req.json();

      body.made_by = currentUser.id;

      const result = await couponService.createCoupon(body);

      return successResponse(result, 201);
    } catch (error) {
      if (error.name === "ZodError") {
        return errorResponse(error.errors, 400);
      }
      if (error.message === "Coupon code already exists") {
        return errorResponse(error.message, 409);
      }
      return errorResponse(error.message || "Internal Server Error", 500);
    }
  },
);
