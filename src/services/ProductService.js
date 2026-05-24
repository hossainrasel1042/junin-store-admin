import { productRepository } from "@/repositories/ProductRepo.js";
import {
  createProductSchema,
  updateProductSchema,
} from "@/validations/ProductSchema.js";
import { sequelize } from "@/lib/db.js";
import supabase from "@/lib/SupabaseConnect.js";
import { QdrantClient } from "@qdrant/js-client-rest";
import { pipeline } from "@xenova/transformers";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_CLUSTER_ENDPOINT,
  apiKey: process.env.QDRANT_CLUSTER_KEY,
});

// Singleton embedding pipeline
class TextEmbedder {
  static instance = null;

  static async getInstance() {
    if (!this.instance) {
      this.instance = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return this.instance;
  }

  static async generate(text) {
    const extractor = await this.getInstance();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}

export { TextEmbedder };
async function uploadImages(files) {
  const urls = [];
  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from("product_img")
      .upload(fileName, buffer, { contentType: file.type });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = supabase.storage
      .from("product_img")
      .getPublicUrl(fileName);
    urls.push(data.publicUrl);
  }
  return urls;
}

class AddProduct {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(productData, imageFiles = []) {
    const imageUrls = await uploadImages(imageFiles);
    productData.images = imageUrls;

    const validatedData = createProductSchema.parse(productData);

    return await sequelize.transaction(async (t) => {
      const newProduct = await this.repository.create(validatedData, {
        transaction: t,
      });

      try {
        const category = newProduct.attributes?.category || "";
        const textToEmbed = `Title: ${newProduct.title}. Description: ${newProduct.description || ""}. Cloth Type: ${newProduct.cloth_type}. Category: ${category}.`;
        const vector = await TextEmbedder.generate(textToEmbed);

        await qdrant.upsert("products", {
          wait: true,
          points: [
            {
              id: newProduct.id,
              payload: {
                title: newProduct.title,
                description: newProduct.description,
                price: newProduct.price,
                cloth_type: newProduct.cloth_type,
                category,
                product_id: newProduct.product_id,
                slug: newProduct.slug,
                images: updatedProduct.images,
              },
              vector,
            },
          ],
        });
      } catch (error) {
        throw new Error(`Qdrant insertion failed: ${error.message}`);
      }

      return newProduct;
    });
  }
}

class UpdateProduct {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id, updateData, editorId, imageFiles = []) {
    const existingProduct = await this.repository.findById(id);
    if (!existingProduct) throw new Error("Product not found");

    const newImageUrls = await uploadImages(imageFiles);
    const existingImages = updateData.existing_images || [];
    updateData.images = [...existingImages, ...newImageUrls];

    const validatedData = updateProductSchema.parse(updateData);

    const editRecord = {
      user_id: editorId,
      timestamp: new Date().toISOString(),
    };
    validatedData.edited_by = [
      ...(existingProduct.edited_by || []),
      editRecord,
    ];

    return await sequelize.transaction(async (t) => {
      const updatedProduct = await this.repository.update(id, validatedData, {
        transaction: t,
      });

      try {
        const category = updatedProduct.attributes?.category || "";

        // 1. Generate the NEW embedding vector so search works properly
        const textToEmbed = `Title: ${updatedProduct.title}. Description: ${updatedProduct.description || ""}. Cloth Type: ${updatedProduct.cloth_type}. Category: ${category}.`;
        const vector = await TextEmbedder.generate(textToEmbed);

        // 2. Use UPSERT to replace both the vector and payload in Qdrant
        await qdrant.upsert("products", {
          wait: true,
          points: [
            {
              id: id,
              payload: {
                title: updatedProduct.title,
                description: updatedProduct.description,
                price: updatedProduct.price,
                cloth_type: updatedProduct.cloth_type,
                category,
                product_id: updatedProduct.product_id, // <--- ADD THIS
                slug: updatedProduct.slug, // <--- ADD THIS
                images: updatedProduct.images, // <--- ADD THIS
              },
              vector,
            },
          ],
        });
      } catch (error) {
        throw new Error(`Qdrant update failed: ${error.message}`);
      }

      return updatedProduct;
    });
  }
}

class DeleteProduct {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    const existingProduct = await this.repository.findById(id);
    if (!existingProduct) throw new Error("Product not found");

    return await sequelize.transaction(async (t) => {
      // 1. Soft Delete from Postgres
      await this.repository.softDelete(id, { transaction: t });

      // 2. Delete from Qdrant
      try {
        await qdrant.delete("products", { wait: true, points: [id] });
      } catch (error) {
        throw new Error(`Qdrant deletion failed: ${error.message}`);
      }

      // 3. Hard Delete images from Supabase Bucket to save space
      if (existingProduct.images && existingProduct.images.length > 0) {
        try {
          // Extract just the filenames from the public URLs
          const fileNames = existingProduct.images.map((url) => {
            const parts = url.split("/");
            return parts[parts.length - 1];
          });

          const { error } = await supabase.storage
            .from("product_img")
            .remove(fileNames);
          if (error)
            console.error("Failed to delete Supabase images:", error.message);
        } catch (err) {
          console.error("Supabase cleanup error:", err.message);
        }
      }

      return { message: "Product deleted successfully", id };
    });
  }
}

class ProductService {
  constructor() {
    this._addProduct = new AddProduct(productRepository);
    this._updateProduct = new UpdateProduct(productRepository);
    this._deleteProduct = new DeleteProduct(productRepository);
  }

  async createProduct(data, imageFiles) {
    return this._addProduct.execute(data, imageFiles);
  }

  async updateProduct(id, updateData, editorId, imageFiles) {
    return this._updateProduct.execute(id, updateData, editorId, imageFiles);
  }

  async deleteProduct(id) {
    return this._deleteProduct.execute(id);
  }

  async getAllProducts({ page = 1, limit = 20, cloth_type, category } = {}) {
    const offset = (page - 1) * limit;
    return productRepository.findAll({ limit, offset, cloth_type, category });
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Product not found");
    return product;
  }

  async getProductBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new Error("Product not found");
    return product;
  }
}

export const productService = new ProductService();
