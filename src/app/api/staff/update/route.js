import { userService } from '@/services/UserService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

export const PUT = requirePermission('staff', 'u', async (req, context, currentUser) => {
  try {
    const formData = await req.formData();
    const updateData = {};
    let imageFile = null;
    let userId = null;

    for (const [key, value] of formData.entries()) {
      if (key === 'id') {
        userId = value;
      } else if (key === 'profile_img' && value instanceof File) {
        if (value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          imageFile = { buffer, originalname: value.name, mimetype: value.type };
        }
      } else {
        if (key === 'permissions' && typeof value === 'string') {
          try { updateData[key] = JSON.parse(value); } catch (e) { updateData[key] = value; }
        } else {
          updateData[key] = value;
        }
      }
    }

    if (!userId) {
      return errorResponse('User ID is required for updating', 400);
    }

    // SECURITY: Prevent staff from upgrading accounts to admin
    if (currentUser.role === 'staff' && updateData.role === 'admin') {
      return errorResponse('Forbidden: Staff members cannot assign Admin roles', 403);
    }

    const result = await userService.updateUser(userId, updateData, imageFile);
    return successResponse(result, 200);
  } catch (error) {
    if (error.name === 'ZodError') return errorResponse(error.errors, 400);
    if (error.message === 'User not found') return errorResponse(error.message, 404);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});