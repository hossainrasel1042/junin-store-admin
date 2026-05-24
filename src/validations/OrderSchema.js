import { z } from "zod";

const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  title: z.string().min(1),
  attributes: z.record(z.string(), z.any()).optional(),
  unit_price: z.number().positive(),
  quantity: z.number().int().positive(),
  item_total: z.number().positive(),
});
export const createOrderSchema = z.object({
  // Guest info
  user_name: z.string().min(1),
  user_phone: z.string().min(7).max(20),
  user_city: z.string().min(1).max(100),
  user_address: z.string().min(1),
  user_ordered: z.array(orderItemSchema).min(1),
  coupon_code: z.string().optional(),
  idempotency_key: z.string().uuid(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "packaged",
    "delivered_to_courier",
    "rejected",
  ]),
});
