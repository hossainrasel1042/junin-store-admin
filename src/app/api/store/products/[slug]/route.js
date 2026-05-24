// GET /api/products/[slug]
import '@/models/EntryModel.js';
import { productService } from '@/services/ProductService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';

export async function GET(_req, { params }) {
  try {
    const { slug } = await params;
    if (!slug) return errorResponse('Slug is required', 400);

    const product = await productService.getProductBySlug(slug);
    return successResponse({ product }, 200);
  } catch (error) {
    if (error.message === 'Product not found') {
      return errorResponse('Product not found', 404);
    }
    console.error('[GET /api/products/[slug]]', error);
    return errorResponse('Failed to fetch product', 500);
  }
}