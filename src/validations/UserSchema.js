import { z } from "zod";

const permissionsSchema = z
  .object({
    product: z.array(z.enum(["r", "w", "u", "d"])).optional(),
    coupon: z.array(z.enum(["r", "w", "u", "d"])).optional(),
    order: z.array(z.enum(["r", "w", "u", "d"])).optional(),
    staff: z.array(z.enum(["r", "w", "u", "d"])).optional(),
    payment: z.array(z.enum(["r"])).optional(),
  })
  .strict(
    "Invalid permission key. Only product, coupon, order, staff, and payment are allowed.",
  );

export const createUserSchema = z.object({
  full_name: z.string().min(6, "Full name must be at least 6 characters long"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  phone: z.string().optional(),
  role: z
    .enum(["admin", "staff"], {
      errorMap: () => ({ message: "Role must be either 'admin' or 'staff'" }),
    })
    .default("staff"),
  profile_img: z.string().url("Profile image must be a valid URL").optional(),
  permissions: permissionsSchema,
});

export const updateUserSchema = createUserSchema.partial();
