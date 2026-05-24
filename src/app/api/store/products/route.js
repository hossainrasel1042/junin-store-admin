import { productService } from '@/services/ProductService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

function parsePagination(searchParams) {
  const rawPage  = searchParams.get('page');
  const rawLimit = searchParams.get('limit');

  const page  = Math.max(DEFAULT_PAGE, parseInt(rawPage)  || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit) || DEFAULT_LIMIT));

  return { page, limit };
}

// GET /api/products?page=1&limit=20
export const GET =  async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit }  = parsePagination(searchParams);

    const { products, total } = await productService.getAllProducts({ page, limit });

    const totalPages = Math.ceil(total / limit);

    // If page requested is beyond available pages and data exists, return 404
    if (page > totalPages && total > 0) {
      return errorResponse(`Page ${page} does not exist. Total pages: ${totalPages}`, 404);
    }

    return successResponse({
      products,
      pagination: {
        total,
        totalPages,
        currentPage:  page,
        limit,
        hasNextPage:  page < totalPages,
        hasPrevPage:  page > 1,
      },
    }, 200);

  } catch (error) {
    console.error('[GET /api/products]', error);
    return errorResponse('Failed to fetch products', 500);
  }
};