// POST /api/store/products/recommend
import { QdrantClient } from '@qdrant/js-client-rest';
import { TextEmbedder } from '@/services/ProductService.js'; 
import { successResponse, errorResponse } from '@/lib/ApiResponse.js';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT,
  apiKey: process.env.QDRANT_CLUSTER_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { history } = body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return errorResponse('Product history is required', 400);
    }

    const visitedIds = history.map(item => item.id);

    const combinedText = history
      .map(item => `Title: ${item.title}. Description: ${item.description || ''}.`)
      .join(' ');

    const vector = await TextEmbedder.generate(combinedText);

    const results = await qdrant.search('products', {
      vector,
      limit: 20, 
      with_payload: true,
    });

    const recommended = results
      .filter(r => !visitedIds.includes(r.id))
      .slice(0, 6);

    const formattedResults = recommended.map(r => ({
      id:          r.id,
      score:       r.score,
      product_id:  r.payload.product_id,
      slug:        r.payload.slug,
      title:       r.payload.title,
      description: r.payload.description,
      price:       r.payload.price,
      cloth_type:  r.payload.cloth_type,
      category:    r.payload.category,
      images:      r.payload.images || [], 
    }));

    return successResponse({ results: formattedResults }, 200);

  } catch (error) {
    console.error('[POST /api/store/products/recommend]', error);
    return errorResponse('Failed to generate recommendations', 500);
  }
}
