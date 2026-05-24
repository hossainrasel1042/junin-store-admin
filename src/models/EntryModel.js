
import { sequelize } from '@/lib/db.js';
import User from './UserModel.js';
import Product from './ProductModel.js';
import Coupon from './CouponModel.js';
import Order from './OrderModel.js';

if (!globalThis._seqAssoc) {
  globalThis._seqAssoc = true;
  User.hasMany(Product, { foreignKey: 'added_by' });
  Product.belongsTo(User, { foreignKey: 'added_by', as: 'creator' });

  User.hasMany(Coupon, { foreignKey: 'made_by' });
  Coupon.belongsTo(User, { foreignKey: 'made_by', as: 'creator' });

  Coupon.hasMany(Order, { foreignKey: 'coupon_id' });
  Order.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

  User.hasMany(Order, { foreignKey: 'approved_by' });
  Order.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
}

export { sequelize, User, Product, Coupon, Order };