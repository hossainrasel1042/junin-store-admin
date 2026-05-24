import { userService } from '@/services/UserService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

export const POST = requirePermission('staff', 'w', async (req, context, currentUser) => {
  try {
    const formData = await req.formData();
    const userData = {};
    let imageFile = null;

    for (const [key, value] of formData.entries()) {
      if (key === 'profile_img' && value instanceof File) {
        if (value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          imageFile = { buffer, originalname: value.name, mimetype: value.type };
        }
      } else {
        if (key === 'permissions' && typeof value === 'string') {
          try { userData[key] = JSON.parse(value); } catch (e) { userData[key] = value; }
        } else {
          userData[key] = value;
        }
      }
    }
    if (currentUser.role === 'staff' && userData.role === 'admin') {
      return errorResponse('Forbidden: Staff members cannot create Admin accounts', 403);
    }

    const result = await userService.createUser(userData, imageFile);
    return successResponse(result, 201);
  } catch (error) {
    if (error.name === 'ZodError') return errorResponse(error.errors, 400);
    if (error.message === 'User with this email already exists') return errorResponse(error.message, 409);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});