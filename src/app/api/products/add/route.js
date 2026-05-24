import { productService } from '@/services/ProductService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

export const POST = requirePermission('product', 'w', async (req, context, currentUser) => {
  try {
    const formData = await req.formData();
    const imageFiles = formData.getAll('images');

    const body = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      discount_price: formData.get('discount_price') ? parseFloat(formData.get('discount_price')) : null,
      cloth_type: formData.get('cloth_type'),
      attributes: formData.get('attributes') ? JSON.parse(formData.get('attributes')) : null,
      added_by: currentUser.id,
    };

    const result = await productService.createProduct(body, imageFiles);
    return successResponse(result, 201);
  } catch (error) {
    if (error.name === 'ZodError') return errorResponse(error.errors, 400);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});