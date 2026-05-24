// GET /api/products/related?id=<product-uuid>&limit=6
// Uses Qdrant vector similarity to find related products
import '@/models/EntryModel.js';
import { QdrantClient } from '@qdrant/js-client-rest';
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT,
  apiKey: process.env.QDRANT_CLUSTER_KEY,
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id    = searchParams.get('id');
    const limit = Math.min(20, parseInt(searchParams.get('limit')) || 6);

    if (!id) return errorResponse('Query parameter "id" is required', 400);

    const results = await qdrant.recommend('products', {
      positive: [id],
      negative: [],
      limit: limit + 1, // +1 to exclude the source product itself
      with_payload: true,
    });

    const filtered = results
      .filter(r => r.id !== id)
      .slice(0, limit);

    return successResponse({
      results: filtered.map(r => ({
        id:         r.id,
        score:      r.score,
        product_id: r.payload.product_id,
        slug:       r.payload.slug,
        title:      r.payload.title,
        price:      r.payload.price,
        cloth_type: r.payload.cloth_type,
        category:   r.payload.category,
      })),
    }, 200);

  } catch (error) {
    console.error('[GET /api/products/related]', error);
    return errorResponse('Failed to fetch related products', 500);
  }
}