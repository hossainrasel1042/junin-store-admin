import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { requirePermission } from "@/middleware/UserPermission.js";
import { couponService } from "@/services/CouponService.js";

export const GET = requirePermission(
  "coupon",
  "r",
  async (req, { params }, currentUser) => {
    try {
      const { id } = params;

      if (!id) {
        return errorResponse("Coupon ID is required", 400);
      }

      const coupon = await couponService.getCouponById(id);

      return successResponse(coupon, 200);
    } catch (error) {
      if (error.message === "Coupon not found") {
        return errorResponse(error.message, 404);
      }
      return errorResponse(error.message || "Internal Server Error", 500);
    }
  },
);
