import { orderService } from '@/services/OrderServices.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

// GET /api/order/search?phone=01XXXXXXXXX
export const GET = requirePermission('order', 'r', async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone')?.trim();

    if (!phone) return errorResponse('phone query param is required', 400);

    const orders = await orderService.getOrdersByPhone(phone);
    return successResponse({ orders, total: orders.length });
  } catch (error) {
    if (error.message === 'No orders found for this phone number') {
      return errorResponse(error.message, 404);
    }
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});
