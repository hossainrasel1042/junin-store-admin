import { productService } from '@/services/ProductService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

// GET /api/products/[id]
export const GET = requirePermission('product', 'r', async (req, context) => {
  try {
    const { id } = await context.params;

    if (!id) return errorResponse('Product ID is required', 400);

    const product = await productService.getProductById(id);
    return successResponse(product, 200);
  } catch (error) {
    if (error.message === 'Product not found') {
      return errorResponse('Product not found', 404);
    }
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});