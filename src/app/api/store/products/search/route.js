// GET /api/products/search?q=blue cotton dress&limit=10&cloth_type=women
import { QdrantClient } from '@qdrant/js-client-rest';
import { pipeline } from '@xenova/transformers';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT,
  apiKey: process.env.QDRANT_CLUSTER_KEY,
});

class TextEmbedder {
  static instance = null;
  static async getInstance() {
    if (!this.instance) this.instance = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    return this.instance;
  }
  static async generate(text) {
    const extractor = await this.getInstance();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }
}

const VALID_CLOTH_TYPES = ['women', 'men', 'kid', 'teen', 'adult'];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q          = searchParams.get('q')?.trim();
    const limit      = Math.min(50, parseInt(searchParams.get('limit')) || 10);
    const cloth_type = searchParams.get('cloth_type');
    const category   = searchParams.get('category')?.trim();

    if (!q) return errorResponse('Query parameter "q" is required', 400);

    const vector = await TextEmbedder.generate(q);

    // Build optional Qdrant filter
    const filter = { must: [] };
    if (cloth_type && VALID_CLOTH_TYPES.includes(cloth_type)) {
      filter.must.push({ key: 'cloth_type', match: { value: cloth_type } });
    }
    if (category) {
      filter.must.push({ key: 'category', match: { value: category } });
    }

    const results = await qdrant.search('products', {
      vector,
      limit,
      with_payload: true,
      ...(filter.must.length > 0 ? { filter } : {}),
    });

    return successResponse({
      query: q,
      results: results.map(r => ({
        id:          r.id,
        score:       r.score,
        product_id:  r.payload.product_id,
        slug:        r.payload.slug,
        title:       r.payload.title,
        description: r.payload.description,
        price:       r.payload.price,
        cloth_type:  r.payload.cloth_type,
        category:    r.payload.category,
      })),
    }, 200);

  } catch (error) {
    console.error('[GET /api/products/search]', error);
    return errorResponse('Search failed', 500);
  }
}