import { Product } from '@/models/EntryModel.js';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';
import { sequelize } from '@/lib/db.js';
import { productService } from '@/services/ProductService.js'; // <-- Import your service

const CATEGORIES = {
  women: ['Tops', 'Dresses', 'Pants', 'Outerwear', 'Traditional'],
  men:   ['Shirts', 'Pants', 'T-Shirts', 'Outerwear', 'Traditional'],
  kid:   ['Tops', 'Bottoms', 'Sets', 'Outerwear', 'Ethnic'],
  teen:  ['Tops', 'Pants', 'Dresses', 'Activewear', 'Ethnic'],
  adult: ['Tops', 'Pants', 'Dresses', 'Outerwear', 'Traditional'],
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cloth_type = searchParams.get('cloth_type');
    const category = searchParams.get('category');
    
    // Optional pagination for the product list
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // ─────────────────────────────────────────────────────────────────
    // NEW BEHAVIOR: If cloth_type is given, list products instead
    // ─────────────────────────────────────────────────────────────────
    if (cloth_type) {
      // This automatically handles if 'category' is passed or if it's null
      const products = await productService.getAllProducts({
        page,
        limit,
        cloth_type,
        category: category || undefined 
      });

      return successResponse({ products }, 200);
    }

    // ─────────────────────────────────────────────────────────────────
    // ORIGINAL BEHAVIOR: No parameters given, return counts map
    // ─────────────────────────────────────────────────────────────────
    const rows = await Product.findAll({
      attributes: [
        'cloth_type',
        [sequelize.literal(`attributes->>'category'`), 'category'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['cloth_type', sequelize.literal(`attributes->>'category'`)],
      raw: true,
    });

    // Build a lookup: { women: { Tops: 12, Pants: 5, ... }, ... }
    const countMap = {};
    for (const row of rows) {
      if (!row.category) continue;
      if (!countMap[row.cloth_type]) countMap[row.cloth_type] = {};
      countMap[row.cloth_type][row.category] = parseInt(row.count);
    }

    // Merge with static category list
    const result = Object.entries(CATEGORIES).map(([ct, cats]) => ({
      cloth_type: ct,
      categories: cats.map(name => ({
        name,
        count: countMap[ct]?.[name] ?? 0,
      })),
    }));

    return successResponse({ categories: result }, 200);
    
  } catch (error) {
    console.error('[GET /api/store/categories]', error);
    return errorResponse('Failed to fetch data', 500);
  }
}