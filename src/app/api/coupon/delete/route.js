import { couponService } from "@/services/CouponService.js";
import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { requirePermission } from "@/middleware/UserPermission.js";

export const DELETE = requirePermission(
  "coupon",
  "d",
  async (req, context, currentUser) => {
    try {
      const body = await req.json();
      console.log(body);
      const { id } = body;

      if (!id) {
        return errorResponse("Coupon ID is required for deletion", 400);
      }

      const result = await couponService.deleteCoupon(id);

      return successResponse(result, 200);
    } catch (error) {
      if (error.message === "Coupon not found") {
        return errorResponse(error.message, 404);
      }
      return errorResponse(error.message || "Internal Server Error", 500);
    }
  },
);
