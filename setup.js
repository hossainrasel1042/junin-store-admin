import 'dotenv/config'; // Loads your .env variables
import { QdrantClient } from '@qdrant/js-client-rest';

// Initialize Qdrant with your cloud credentials
const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT,
  apiKey: process.env.QDRANT_CLUSTER_KEY
});

async function createProductCollection() {
  const collectionName = 'products';

  try {
    // 1. Check if the collection already exists
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === collectionName);

    if (exists) {
      console.log(`Collection '${collectionName}' already exists. Deleting it to start fresh...`);
      await qdrant.deleteCollection(collectionName);
    }

    // 2. Create the collection with 384 dimensions
    console.log(`Creating collection '${collectionName}'...`);
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: 384,          // MUST match the Xenova/all-MiniLM-L6-v2 output size
        distance: 'Cosine'  // Cosine similarity is best for text embeddings
      }
    });

    console.log("✅ Successfully created Qdrant collection for products!");

  } catch (error) {
    console.error("❌ Failed to create collection:", error);
  }
}

createProductCollection();