import { successResponse, errorResponse } from "@/lib/ApiResponse.js";
import { requirePermission } from "@/middleware/UserPermission.js";
import supabase from "@/lib/SupabaseConnect.js";

const LIMIT = 20;

// GET /api/audit?page=1
// GET /api/audit?phone=01XXXXXXXXX
export const GET = requirePermission("audit", "r", async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const phone = searchParams.get("phone")?.trim() || null;
    const from = (page - 1) * LIMIT;
    const to = from + LIMIT - 1;

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (phone) query = query.eq("user_phone", phone);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return successResponse({ logs: data, total: count, page, limit: LIMIT });
  } catch (error) {
    return errorResponse(error.message || "Internal Server Error", 500);
  }
});
