import { z } from "zod";

const clothTypes = ["women", "men", "kid", "teen", "adult"];

const baseProductSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(2, "Title must be at least 2 characters long")
    .max(255, "Title cannot exceed 255 characters"),

  description: z.string().optional(),

  price: z.coerce
    .number({ required_error: "Price is required" })
    .positive("Price must be greater than 0"),

  discount_price: z.coerce
    .number()
    .nonnegative("Discount price cannot be negative")
    .optional(),

  cloth_type: z.enum(clothTypes, {
    errorMap: () => ({
      message: `Cloth type must be one of: ${clothTypes.join(", ")}`,
    }),
  }),

  // Images array: Must be an array of strings, minimum 1 image required
  images: z
    .array(z.string({ required_error: "Images are required" }), {
      invalid_type_error: "Images must be a list of text/URLs",
    })
    .min(1, "You must provide at least one image"),

  attributes: z.record(z.unknown()).optional(),

  added_by: z.string().uuid({ message: "added_by must be a valid UUID" }),
});

export const createProductSchema = baseProductSchema.refine(
  (data) => {
    if (data.discount_price !== undefined) {
      return data.discount_price < data.price;
    }
    return true;
  },
  {
    message: "Discount price must be less than the regular price",
    path: ["discount_price"],
  },
);

export const updateProductSchema = baseProductSchema.partial().refine(
  (data) => {
    if (data.price !== undefined && data.discount_price !== undefined) {
      return data.discount_price < data.price;
    }
    return true;
  },
  {
    message: "Discount price must be less than the regular price",
    path: ["discount_price"],
  },
);
