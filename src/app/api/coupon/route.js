import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { requirePermission } from "@/middleware/UserPermission.js";
import Coupon from "@/models/CouponModel.js";

export const GET = requirePermission(
  "coupon",
  "r",
  async (req, context, currentUser) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const offset = (page - 1) * limit;

      const { count, rows } = await Coupon.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return successResponse(
        {
          total: count,
          page,
          limit,
          coupons: rows,
        },
        200,
      );
    } catch (error) {
      return errorResponse(error.message || "Internal Server Error", 500);
    }
  },
);
