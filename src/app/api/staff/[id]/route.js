import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';
import { userService } from '@/services/UserService.js'; 
export const GET = requirePermission('staff', 'r', async (req, context) => {
  try {
    const { id } = await context.params;
    if (!id) {
      return errorResponse('User ID is required', 400);
    }
    const user = await userService.getUserById(id);
    return successResponse(user, 200);
  } catch (error) {
    if (error.message === 'User not found') {
      return errorResponse(error.message, 404);
    }
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});