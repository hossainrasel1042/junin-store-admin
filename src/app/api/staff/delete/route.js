import { userService } from '@/services/UserService.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';

export const DELETE = requirePermission('staff', 'd', async (req, context, currentUser) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return errorResponse('User ID is required for deletion', 400);
    }

    if (id === currentUser.id) {
      return errorResponse('Forbidden: You cannot delete your own account', 403);
    }

    const result = await userService.deleteUser(id);
    return successResponse(result, 200);
  } catch (error) {
    if (error.message === 'User not found') return errorResponse(error.message, 404);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});