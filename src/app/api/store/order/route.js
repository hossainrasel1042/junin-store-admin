
import { orderService } from '@/services/OrderService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
 
// POST /api/store/order
// Public — no auth. Called when a guest clicks Buy / Checkout.
// Client must generate a UUID idempotency_key and send it with every request.
export async function POST(req) {
  try {
    const body = await req.json();
 
    // Guard: idempotency_key must come from the client
    if (!body.idempotency_key) {
      return errorResponse('idempotency_key is required', 400);
    }
 
    const order = await orderService.createOrder(body);
    return successResponse(order, 201);
  } catch (error) {
    if (error.name === 'ZodError')           return errorResponse(error.errors, 400);
    if (error.message === 'Invalid coupon code') return errorResponse(error.message, 422);
    if (error.message === 'Coupon has expired')  return errorResponse(error.message, 422);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
 
