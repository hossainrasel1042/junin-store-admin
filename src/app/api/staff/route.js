import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { requirePermission } from '@/middleware/UserPermission.js';
import { userService } from '@/services/UserService.js';

export const GET = requirePermission('staff', 'r', async (req, context, currentUser) => {
  try {
    const users = await userService.getAllUsers();
    return successResponse(users, 200);
  } catch (error) {
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
});