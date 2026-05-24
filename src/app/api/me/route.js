import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { verifyToken } from "@/lib/Jwt.js";
import supabase from "@/lib/SupabaseConnect.js";
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Unauthorized: Missing token", 401);
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse("Unauthorized: Invalid token", 401);
    }
    const { data, error } = await supabase
      .from("users")
      .select("email, profile_img,full_name, role, permissions")
      .eq("id", decoded.id)
      .single();
    if (error) throw error;

    const response = successResponse(data, 200);
    response.headers.set(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300",
    );
    return response;
  } catch (error) {
    console.error("Profile fetch error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
