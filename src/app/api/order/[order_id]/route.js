import { orderService } from '@/services/OrderServices.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

// GET /api/order/[order_id]
export const GET = requirePermission('order', 'r', async (req, { params }) => {
  try {
    const { order_id } = await params;
    const order = await orderService.getOrderByOrderId(order_id);
    return successResponse(order);
  } catch (error) {
    if (error.message === 'Order not found') return errorResponse(error.message, 404);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});
