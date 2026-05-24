import '@/models/EntryModel.js';
import { Product, User } from '@/models/EntryModel.js';
import { Op } from 'sequelize';
import { sequelize } from '@/lib/db.js';

class ProductRepository {
  async findAll({ limit = 20, offset = 0, cloth_type, category } = {}) {
    const where = {};

    if (cloth_type) where.cloth_type = cloth_type;

    if (category) {
      where[Op.and] = sequelize.literal(
        `attributes->>'category' = ${sequelize.escape(category)}`
      );
    }

    const { rows, count } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['id', 'email', 'role'] }],
    });

    return { products: rows, total: count };
  }

  async findById(id, options = {}) {
    return Product.findByPk(id, {
      ...options,
      include: [{ model: User, as: 'creator', attributes: ['id', 'email', 'role'] }],
    });
  }

  async findBySlug(slug) {
    return Product.findOne({
      where: { slug },
      include: [{ model: User, as: 'creator', attributes: ['id', 'email', 'role'] }],
    });
  }

  async create(data, options = {}) {
    return Product.create(data, options);
  }

  async update(id, data, options = {}) {
    await Product.update(data, { where: { id }, ...options });
    return this.findById(id, options);
  }

  async softDelete(id, options = {}) {
    return Product.destroy({ where: { id }, ...options });
  }
}

export const productRepository = new ProductRepository();