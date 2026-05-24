import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.STRING(13),
      allowNull: true, // set by beforeCreate hook
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: true, // set by beforeCreate hook
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cloth_type: {
      type: DataTypes.ENUM("women", "men", "kid", "teen", "adult"),
      allowNull: false,
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    attributes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    edited_by: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    added_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
);

// Auto-generate product_id and slug before INSERT
Product.addHook("beforeCreate", (product) => {
  const rawId = nanoid(8).toUpperCase();
  product.product_id = `PROD-${rawId}`;

  const titleSlug = (product.title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  product.slug = `${titleSlug}-${product.product_id.toLowerCase()}`;
});

export default Product;
