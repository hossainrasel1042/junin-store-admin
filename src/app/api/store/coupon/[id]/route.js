import { NextResponse } from "next/server";
import Coupon from "@/models/CouponModel.js";
import { successResponse, errorResponse } from "@/lib/ApiResponse.js";

export const GET = async (req, { params }) => {
  try {
    const { id } = params;

    if (!id) {
      return errorResponse("Coupon identifier is required", 400);
    }
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return errorResponse("Coupon not found or invalid", 404);
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return errorResponse("This coupon has expired", 410);
    }

    const { made_by, ...publicCouponData } = coupon.toJSON();

    return successResponse(publicCouponData, 200);
  } catch (error) {
    return errorResponse(error.message || "Internal Server Error", 500);
  }
};
