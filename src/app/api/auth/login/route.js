import { authService } from "@/services/AuthService.js";
import { loginSchema } from "@/validations/AuthSchema.js";
import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
export async function POST(req) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const result = await authService.login(
      validatedData.email,
      validatedData.password,
    );
    return successResponse(result, 200);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(error.errors, 400);
    }
    if (error.message === "Invalid email or password") {
      return errorResponse(error.message, 401);
    }
    return errorResponse("Internal Server Error", 500);
  }
}
