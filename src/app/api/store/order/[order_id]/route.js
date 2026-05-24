import { orderRepository } from '@/repositories/OrderRepo.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';

// GET /api/store/order/[order_id]
// Public — no auth required. Returns only user_name, total_payment, status.
export async function GET(req, { params }) {
  try {
    const { order_id } = await params;
    const order = await orderRepository.findByOrderId(order_id);
    if (!order) return errorResponse('Order not found', 404);

    return successResponse({
      user_name:     order.user_name,
      total_payment: order.total_payment,
      status:        order.status,
    });
  } catch (error) {
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
