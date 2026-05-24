import { z } from 'zod';

export const createCouponSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  code: z.string().min(3, "Coupon code must be at least 3 characters"),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().positive("Discount value must be a positive number"),
  expires_at: z.string().datetime({ message: "Invalid date format. Use ISO 8601 string" }).optional(),
  made_by: z.string().uuid("Invalid user ID"), // <--- Add this line!
});

export const updateCouponSchema = createCouponSchema.partial();