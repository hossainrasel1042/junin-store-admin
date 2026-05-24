import { orderService } from "@/services/OrderServices.js";
import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { requirePermission } from "@/middleware/UserPermission.js";

// GET /api/order?page=1&limit=20&status=pending
export const GET = requirePermission("order", "r", async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") || undefined;

    const result = await orderService.getAllOrders({ page, limit, status });
    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message || "Internal Server Error", 500);
  }
});

export const PATCH = requirePermission(
  "order",
  "u",
  async (req, _ctx, currentUser) => {
    try {
      const { id, status } = await req.json();
      if (!id || !status)
        return errorResponse("id and status are required", 400);

      const updated = await orderService.updateOrderStatus(
        id,
        status,
        currentUser.id,
      );
      return successResponse(updated);
    } catch (error) {
      if (error.name === "ZodError") return errorResponse(error.errors, 400);
      if (error.message === "Order not found")
        return errorResponse(error.message, 404);
      return errorResponse(error.message || "Internal Server Error", 500);
    }
  },
);

// DELETE /api/order
export const DELETE = requirePermission("order", "d", async (req) => {
  try {
    const { id } = await req.json();
    if (!id) return errorResponse("id is required", 400);

    await orderService.deleteOrder(id);
    return successResponse({ message: "Order deleted successfully", id });
  } catch (error) {
    if (error.message === "Order not found")
      return errorResponse(error.message, 404);
    return errorResponse(error.message || "Internal Server Error", 500);
  }
});
