import { DataTypes, Model } from "sequelize";
import { sequelize } from "@/lib/db.js";
import { v4 as uuidv4 } from "uuid";
class Coupon extends Model {}

Coupon.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed_amount"),
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    made_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "coupons",
    timestamps: true,
    updatedAt: false,
    underscored: true,
  },
);

export default Coupon;
