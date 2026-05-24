import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true,
    },

    // ── Guest customer info ──────────
    user_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    user_city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    user_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // ── Ordered items snapshot ────────────────────────────────────────
    /*
      Example structure:
      [
        {
          "product_id"   : "uuid-of-product",
          "title"        : "Red T-Shirt",
          "attributes"   : { "size": "L", "color": "Red" },
          "unit_price"   : 25.00,
          "quantity"     : 2,
          "item_total"   : 50.00
        }
      ]
    */
    user_ordered: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },

    // ── Pricing ───────────────────────────────────────────────────────
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Sum of all item_totals before discount",
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "coupons", key: "id" },
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total_payment: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "total_price - discount_amount",
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "packaged",
        "delivered_to_courier",
        "rejected",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    idempotency_key: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      comment:
        "Client-generated UUID sent at checkout to prevent duplicate orders",
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ["order_id"] },
      { fields: ["id"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
      { unique: true, fields: ["idempotency_key"] },
    ],
  },
);

Order.addHook("beforeCreate", (order) => {
  const rawId = nanoid(10).toUpperCase();
  order.order_id = `ORD-${rawId}`;
});

export default Order;
