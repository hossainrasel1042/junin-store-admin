import { productService } from '@/services/ProductService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

export const PUT = requirePermission('product', 'u', async (req, context, currentUser) => {
  try {
    const formData = await req.formData();
    
    const id = formData.get('id');
    if (!id) return errorResponse('Product ID is required', 400);

    const imageFiles = formData.getAll('images');
    
    const updateData = {};
    if (formData.has('title')) updateData.title = formData.get('title');
    if (formData.has('description')) updateData.description = formData.get('description');
    if (formData.has('price')) updateData.price = parseFloat(formData.get('price'));
    if (formData.has('cloth_type')) updateData.cloth_type = formData.get('cloth_type');
    if (formData.has('attributes')) updateData.attributes = JSON.parse(formData.get('attributes'));
    if (formData.has('discount_price')) {
      const dp = formData.get('discount_price');
      updateData.discount_price = dp === 'null' || !dp ? null : parseFloat(dp);
    }
    
    updateData.existing_images = formData.getAll('existing_images');
    const result = await productService.updateProduct(id, updateData, currentUser.id, imageFiles);
    return successResponse(result, 200);
  } catch (error) {
    if (error.name === 'ZodError') return errorResponse(error.errors, 400);
    if (error.message === 'Product not found') return errorResponse(error.message, 404);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});