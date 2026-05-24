import { errorResponse } from '@/lib/ApiResponse.js';
import { verifyToken } from '@/lib/Jwt.js';
import supabase from '@/lib/SupabaseConnect.js';

async function insertAuditLog(user, module, action, ip) {
  if (action === 'r') {
    return; 
  }
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('phone, email')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Supabase User Fetch Error:', userError);
    }

  
    const { error: insertError } = await supabase.from('audit_logs').insert({
      user_id:    user.id,
      user_name:  user.email || userData?.email || 'Unknown', 
      user_phone: userData?.phone ?? null,
      user_role:  user.role,
      action,
      module,
      ip_address: ip,
    });

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
    } else {
      console.log('Audit log inserted successfully!');
    }

  } catch (err) {
    console.error('Audit log unexpected error:', err.message);
  }
}

function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure permission check — unchanged
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pure utility to check if a user has a specific permission.
 * @param {Object} user - The decoded user payload from the JWT
 * @param {String} module - The module name (e.g., 'staff', 'product')
 * @param {String} action - The action (e.g., 'r', 'w', 'u', 'd')
 * @returns {Boolean}
 */
export const checkPermission = (user, module, action) => {
  if (!user) return false;

  if (user.role === 'admin') return true;

  if (user.role === 'staff') {
    const modulePermissions = user.permissions?.[module] || [];
    return modulePermissions.includes(action);
  }

  return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// Middleware wrapper — audit log injected after successful handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * API Route Middleware Wrapper
 * Wraps an API handler and enforces JWT validation & permissions before the handler runs.
 *
 * @param {String} module - The module name (e.g., 'staff')
 * @param {String} action - The action required (e.g., 'd')
 * @param {Function} handler - Your actual API route function
 */
export const requirePermission = (module, action, handler) => {
  return async (req, context) => {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse('Unauthorized: Missing or invalid authorization header', 401);
      }

      const token = authHeader.split(' ')[1];
      const currentUser = verifyToken(token); 

      if (!currentUser) {
        return errorResponse('Unauthorized: Invalid or expired token', 401);
      }

      if (!checkPermission(currentUser, module, action)) {
        return errorResponse(`Forbidden: You lack '${action}' permission for the '${module}' module`, 403);
      }

      const response = await handler(req, context, currentUser);

       await insertAuditLog(currentUser, module, action, getClientIp(req));

      return response;
    } catch (error) {
      console.error('Authorization Middleware Error:', error);
      return errorResponse('Internal Server Error during authorization', 500);
    }
  };
};
