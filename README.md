# Junin Store Admin

**Project Stage**: Building.

**Project Open Source**: Yes.

**Project Deployment**: Not because of have some bugs.Full Complete 06/1/2026. 

---

## 📖 Table of Contents
* [Features](#features)
* [Tech Stack](#tech-stack)
* [API Guidelines](#api-guideline)
* [Secret keys](#env)

---

## 🚀 Features <a id="features"></a>
* **Role-Based Access Control (RBAC):** Secure administration with granular permission management for staff members.
* **AI-Powered Product Search:** Vector-based search functionality allowing for semantic discovery of inventory.
* **Inventory Management:** Full CRUD operations for products with dynamic image management.
* **Order Tracking & Management:** Streamlined order processing with idempotency keys to prevent duplicate entries.
* **Audit Logging:** Comprehensive tracking of all administrative actions for transparency and security.
* **Dynamic Coupon System:** Flexible discounting tools for promotional campaigns.
* **Security:** Full Security of Admin panel due to **RBAC**.Only render items which have permission

---

## 🛠️ Tech Stack <a id="tech-stack"></a>

* **Next.js (Server API):** Used for building a robust, high-performance API backend within the Next.js framework, allowing seamless integration between server-side logic and frontend routes.
* **Sequelize:** A powerful ORM that simplifies database interactions by mapping objects to relational database tables, ensuring maintainable and type-safe data models.
* **Bcrypt:** A secure library for hashing passwords, ensuring that user credentials remain protected against unauthorized access.
* **Nanoid:** A tiny, secure, URL-friendly string generator used for creating unique identifiers (like Product and Order IDs).
* **Supabase (Storage & Database):** Provides a scalable, managed PostgreSQL database and reliable object storage for product and profile images.
* **Qdrant & Xenova (Transformers):** Qdrant serves as our vector database, while Xenova (Transformers.js) handles text-to-vector embedding, enabling advanced semantic search capabilities.

---

## 🔗 API Guideline
For detailed documentation on endpoints, request structures, and authentication, please refer to our dedicated guide:
[**View API Documentation**](./API_GUIDELINE.md)




# Junin Store — API Reference <div id="api-guideline">

> **Base URL:** `http://localhost:3000` (set via `NEXT_PUBLIC_BASE_URL`)  
> All responses follow the shape `{ success: true, data: ... }` on success and `{ success: false, message: ... }` on error.

---

## Table of Contents

- [🔐 Private Admin API](#-private-admin-api)
  - [Authentication](#authentication)
  - [My Profile](#my-profile)
  - [Staff Management](#staff-management)
  - [Product Management](#product-management)
  - [Order Management](#order-management)
  - [Coupon Management](#coupon-management)
  - [Audit Logs](#audit-logs)
- [🌐 Public Store API](#-public-store-api)
  - [Products](#products)
  - [Orders](#orders)
  - [Coupons](#coupons)

---

## 🔐 Private Admin API

All private endpoints require a valid **Bearer token** in the `Authorization` header (except `/api/auth/login`) and the caller must have the appropriate role/permission.

```
Authorization: Bearer <token>
```

---

### Authentication

#### `POST /api/auth/login`

Authenticates an admin/staff user and returns a JWT token.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | Registered email address |
| `password` | string | ✅ Yes | Account password |

**Example Request**
```json
{
  "email": "admin@juninstore.com",
  "password": "securepassword"
}
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "a1b2c3d4-...",
      "email": "admin@juninstore.com",
      "role": "admin"
    }
  }
}
```

---

### My Profile

#### `GET /api/me`

Returns the authenticated user's own profile info (email and avatar). Cached for 60 seconds.

**Headers**

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | ✅ Yes | `Bearer <token>` |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "email": "admin@juninstore.com",
    "profile_img": "https://cdn.example.com/avatars/admin.jpg"
  }
}
```

---

### Staff Management

#### `GET /api/staff`

Returns a list of all staff and admin users.

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-...",
      "name": "Rasel Ahmed",
      "email": "rasel@juninstore.com",
      "role": "staff",
      "profile_img": "https://cdn.example.com/avatars/rasel.jpg",
      "permissions": { "product": "rw", "order": "r" }
    }
  ]
}
```

---

#### `GET /api/staff/[id]`

Returns a single staff member by their UUID.

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `id` | ✅ Yes | Staff member UUID |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Rasel Ahmed",
    "email": "rasel@juninstore.com",
    "role": "staff",
    "profile_img": "https://cdn.example.com/avatars/rasel.jpg",
    "permissions": { "product": "rw", "order": "r" }
  }
}
```

---

#### `POST /api/staff/add`

Creates a new staff or admin account. Staff cannot create admin accounts.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Full name |
| `email` | string | ✅ Yes | Unique email address |
| `password` | string | ✅ Yes | Account password |
| `role` | string | ✅ Yes | `admin` or `staff` |
| `permissions` | JSON string | ❌ No | Permission map e.g. `{"product":"rw","order":"r"}` |
| `profile_img` | File | ❌ No | Profile photo (image file) |

**Example Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-...",
    "name": "New Staff",
    "email": "staff@juninstore.com",
    "role": "staff"
  }
}
```

---

#### `PUT /api/staff/update`

Updates an existing staff member's information.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | UUID of the staff member to update |
| `name` | string | ❌ No | Updated full name |
| `email` | string | ❌ No | Updated email address |
| `role` | string | ❌ No | `admin` or `staff` (staff cannot promote to admin) |
| `permissions` | JSON string | ❌ No | Updated permissions map |
| `profile_img` | File | ❌ No | New profile photo |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Updated Name",
    "role": "staff"
  }
}
```

---

#### `DELETE /api/staff/delete`

Deletes a staff member. Users cannot delete their own account.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | UUID of the staff member to delete |

**Example Request**
```json
{ "id": "a1b2c3d4-..." }
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": { "message": "User deleted successfully" }
}
```

---

### Product Management

#### `GET /api/products?page=1&limit=20`

Returns a paginated list of all products for the admin panel.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | ❌ No | Page number (default: `1`) |
| `limit` | number | ❌ No | Items per page (default: `20`, max: `100`) |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-uuid-...",
        "title": "Blue Cotton T-Shirt",
        "slug": "blue-tsirt-prod-nlq7_ifx",
        "price": 19.99,
        "discount_price": 14.99,
        "cloth_type": "men",
        "images": ["https://cdn.example.com/img1.jpg"],
        "attributes": { "category": "T-Shirts", "size": "M" }
      }
    ],
    "pagination": {
      "total": 120,
      "totalPages": 6,
      "currentPage": 1,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### `GET /api/products/[id]`

Returns a single product by its internal UUID (admin use).

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `id` | ✅ Yes | Product UUID |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid-...",
    "title": "Blue Cotton T-Shirt",
    "slug": "blue-tsirt-prod-nlq7_ifx",
    "description": "Lightweight everyday tee.",
    "price": 19.99,
    "discount_price": 14.99,
    "cloth_type": "men",
    "images": ["https://cdn.example.com/img1.jpg"],
    "attributes": { "category": "T-Shirts", "color": "Blue", "size": "M" }
  }
}
```

---

#### `POST /api/products/add`

Creates a new product with image uploads.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | Product title |
| `price` | number | ✅ Yes | Regular price |
| `cloth_type` | string | ✅ Yes | Category: `men`, `women`, `teen`, `adult`, `kid` |
| `description` | string | ❌ No | Product description |
| `discount_price` | number | ❌ No | Sale price (omit or `null` if no discount) |
| `attributes` | JSON string | ❌ No | Extra attributes e.g. `{"category":"T-Shirts","size":"M","color":"Blue"}` |
| `images` | File[] | ❌ No | One or more product image files |

**Example Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid-...",
    "slug": "blue-tsirt-prod-nlq7_ifx",
    "title": "Blue Cotton T-Shirt",
    "price": 19.99
  }
}
```

---

#### `PUT /api/products/update`

Updates an existing product. Only send fields you want to change.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Product UUID |
| `title` | string | ❌ No | Updated title |
| `description` | string | ❌ No | Updated description |
| `price` | number | ❌ No | Updated price |
| `discount_price` | number \| `"null"` | ❌ No | Updated sale price; send `"null"` to clear |
| `cloth_type` | string | ❌ No | Updated cloth type |
| `attributes` | JSON string | ❌ No | Updated attributes object |
| `existing_images` | string[] | ❌ No | URLs of current images to keep (others are deleted) |
| `images` | File[] | ❌ No | New image files to add |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "prod-uuid-...",
    "title": "Updated Title",
    "price": 24.99
  }
}
```

---

#### `DELETE /api/products/delete`

Permanently deletes a product and its associated images.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Product UUID |

**Example Request**
```json
{ "id": "prod-uuid-..." }
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": { "message": "Product deleted successfully" }
}
```

---

### Order Management

#### `GET /api/order?page=1&limit=20&status=pending`

Returns all orders with optional status filtering and pagination.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | ❌ No | Page number (default: `1`) |
| `limit` | number | ❌ No | Items per page (default: `20`) |
| `status` | string | ❌ No | Filter by status: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord-uuid-...",
        "order_id": "ORD-20260524-001",
        "user_name": "Rasel Ahmed",
        "user_phone": "01800000000",
        "total_payment": 49.98,
        "status": "pending",
        "createdAt": "2026-05-24T10:00:00.000Z"
      }
    ],
    "total": 85,
    "page": 1,
    "limit": 20
  }
}
```

---

#### `GET /api/order/[order_id]`

Returns full details of a single order by its order ID string.

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `order_id` | ✅ Yes | Human-readable order ID e.g. `ORD-20260524-001` |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "ord-uuid-...",
    "order_id": "ORD-20260524-001",
    "user_name": "Rasel Ahmed",
    "user_phone": "01800000000",
    "address": "Chittagong, Bangladesh",
    "items": [
      { "product_id": "prod-uuid-...", "title": "Blue T-Shirt", "quantity": 2, "price": 19.99 }
    ],
    "coupon_code": "SAVE10",
    "total_payment": 35.98,
    "status": "pending",
    "createdAt": "2026-05-24T10:00:00.000Z"
  }
}
```

---

#### `PATCH /api/order`

Updates the status of an order.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Order UUID |
| `status` | string | ✅ Yes | New status: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |

**Example Request**
```json
{ "id": "ord-uuid-...", "status": "shipped" }
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "ord-uuid-...",
    "status": "shipped",
    "updated_by": "admin-uuid-..."
  }
}
```

---

#### `DELETE /api/order`

Permanently deletes an order record.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Order UUID |

**Example Request**
```json
{ "id": "ord-uuid-..." }
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": { "message": "Order deleted successfully", "id": "ord-uuid-..." }
}
```

---

#### `GET /api/order/search?phone=01XXXXXXXXX`

Finds all orders placed by a specific customer phone number.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | ✅ Yes | Customer phone number |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "order_id": "ORD-20260524-001",
        "total_payment": 49.98,
        "status": "delivered"
      }
    ],
    "total": 1
  }
}
```

---

### Coupon Management

#### `GET /api/coupon?page=1&limit=20`

Returns a paginated list of all coupons.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | ❌ No | Page number (default: `1`) |
| `limit` | number | ❌ No | Items per page (default: `20`) |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "coupons": [
      {
        "id": "coup-uuid-...",
        "code": "SAVE10",
        "discount_type": "percentage",
        "discount_value": 10,
        "expires_at": "2026-12-31T23:59:59.000Z",
        "made_by": "admin-uuid-..."
      }
    ]
  }
}
```

---

#### `GET /api/coupon/[id]`

Returns a single coupon by UUID.

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `id` | ✅ Yes | Coupon UUID |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "coup-uuid-...",
    "code": "SAVE10",
    "discount_type": "percentage",
    "discount_value": 10,
    "expires_at": "2026-12-31T23:59:59.000Z"
  }
}
```

---

#### `POST /api/coupon/add`

Creates a new coupon. `made_by` is automatically set from the authenticated user.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | ✅ Yes | Unique coupon code e.g. `SAVE10` |
| `discount_type` | string | ✅ Yes | `percentage` or `fixed` |
| `discount_value` | number | ✅ Yes | Discount amount (e.g. `10` = 10% or $10) |
| `expires_at` | ISO string | ❌ No | Expiry date-time (UTC) |

**Example Request**
```json
{
  "code": "SUMMER25",
  "discount_type": "percentage",
  "discount_value": 25,
  "expires_at": "2026-09-01T00:00:00.000Z"
}
```

**Example Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "coup-uuid-...",
    "code": "SUMMER25",
    "discount_type": "percentage",
    "discount_value": 25
  }
}
```

---

#### `DELETE /api/coupon/delete`

Deletes a coupon permanently.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Coupon UUID |

**Example Request**
```json
{ "id": "coup-uuid-..." }
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": { "message": "Coupon deleted successfully" }
}
```

---

### Audit Logs

#### `GET /api/audit?page=1`
#### `GET /api/audit?phone=01XXXXXXXXX`

Returns paginated admin activity logs. Can be filtered by user phone. Returns 20 records per page.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | ❌ No | Page number (default: `1`) |
| `phone` | string | ❌ No | Filter logs by the acting user's phone number |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-uuid-...",
        "user_phone": "01800000000",
        "action": "updated order status to shipped",
        "entity": "order",
        "entity_id": "ord-uuid-...",
        "created_at": "2026-05-24T11:00:00.000Z"
      }
    ],
    "total": 145,
    "page": 1,
    "limit": 20
  }
}
```

---

---

## 🌐 Public Store API

These endpoints require **no authentication**. They are called directly from the storefront.

---

### Products

#### `GET /api/store/products?page=1&limit=20`

Returns a paginated list of all published products for the storefront.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | ❌ No | Page number (default: `1`) |
| `limit` | number | ❌ No | Items per page (default: `20`, max: `100`) |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-uuid-...",
        "title": "Blue Cotton T-Shirt",
        "slug": "blue-tsirt-prod-nlq7_ifx",
        "price": 19.99,
        "discount_price": 14.99,
        "cloth_type": "men",
        "images": ["https://cdn.example.com/img1.jpg"],
        "attributes": { "category": "T-Shirts" }
      }
    ],
    "pagination": {
      "total": 120,
      "totalPages": 6,
      "currentPage": 1,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### `GET /api/store/products/[slug]`

Returns a single product by its URL slug for the product detail page.

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `slug` | ✅ Yes | Product slug e.g. `blue-tsirt-prod-nlq7_ifx` |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-uuid-...",
      "title": "Blue Cotton T-Shirt",
      "slug": "blue-tsirt-prod-nlq7_ifx",
      "description": "Lightweight everyday tee made from 100% cotton.",
      "price": 19.99,
      "discount_price": 14.99,
      "cloth_type": "men",
      "images": ["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"],
      "attributes": { "category": "T-Shirts", "color": "Blue", "size": "M" }
    }
  }
}
```

---

#### `GET /api/store/products/categories`

Two behaviors depending on params:

- **No params** → returns category counts map for all cloth types
- **With `cloth_type`** → returns a paginated product list for that cloth type

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `cloth_type` | string | ❌ No | `men`, `women`, `teen`, `adult`, `kid` — switches to product listing mode |
| `category` | string | ❌ No | Sub-category filter e.g. `T-Shirts`, `Dresses` (only with `cloth_type`) |
| `page` | number | ❌ No | Page number for product listing (default: `1`) |
| `limit` | number | ❌ No | Items per page for product listing (default: `20`) |

**Example Response — no params** `200 OK`
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "cloth_type": "men",
        "categories": [
          { "name": "Shirts", "count": 14 },
          { "name": "T-Shirts", "count": 22 }
        ]
      },
      {
        "cloth_type": "women",
        "categories": [
          { "name": "Tops", "count": 18 },
          { "name": "Dresses", "count": 9 }
        ]
      }
    ]
  }
}
```

**Example Response — with `cloth_type=men&limit=6`** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": {
      "products": [
        {
          "id": "prod-uuid-...",
          "title": "Blue Cotton T-Shirt",
          "price": 19.99,
          "images": ["https://cdn.example.com/img1.jpg"]
        }
      ],
      "total": 36
    }
  }
}
```

---

#### `GET /api/store/products/search?q=blue cotton dress`

Semantic vector search over products using Qdrant + MiniLM embeddings.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | ✅ Yes | Search query text |
| `limit` | number | ❌ No | Max results (default: `10`, max: `50`) |
| `cloth_type` | string | ❌ No | Filter by cloth type: `men`, `women`, `teen`, `adult`, `kid` |
| `category` | string | ❌ No | Filter by sub-category e.g. `Dresses` |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "query": "blue cotton dress",
    "results": [
      {
        "id": "qdrant-point-id",
        "score": 0.91,
        "product_id": "prod-uuid-...",
        "slug": "blue-floral-dress-prod-abc123",
        "title": "Blue Floral Summer Dress",
        "description": "Lightweight floral dress for warm weather.",
        "price": 34.99,
        "cloth_type": "women",
        "category": "Dresses"
      }
    ]
  }
}
```

---

#### `GET /api/store/products/related?id=<product-uuid>&limit=6`

Returns visually and semantically related products using Qdrant vector recommendations.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ Yes | Qdrant point ID of the source product |
| `limit` | number | ❌ No | Number of results (default: `6`, max: `20`) |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "qdrant-point-id",
        "score": 0.87,
        "product_id": "prod-uuid-...",
        "slug": "white-polo-shirt-prod-xyz",
        "title": "White Polo Shirt",
        "price": 22.99,
        "cloth_type": "men",
        "category": "Shirts"
      }
    ]
  }
}
```

---

#### `POST /api/store/products/recommend`

Returns AI-personalized product recommendations based on the user's browsing history using Qdrant vector similarity.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `history` | array | ✅ Yes | Array of recently viewed product objects |
| `history[].id` | string | ✅ Yes | Qdrant point ID of the viewed product |
| `history[].title` | string | ✅ Yes | Product title (used to build embedding) |
| `history[].description` | string | ❌ No | Product description (improves recommendation quality) |

**Example Request**
```json
{
  "history": [
    {
      "id": "qdrant-point-id-1",
      "title": "Blue Cotton T-Shirt",
      "description": "Lightweight everyday tee."
    },
    {
      "id": "qdrant-point-id-2",
      "title": "Slim Fit Chinos",
      "description": "Stretch chinos for modern men."
    }
  ]
}
```

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "qdrant-point-id",
        "score": 0.89,
        "product_id": "prod-uuid-...",
        "slug": "navy-polo-shirt-prod-def456",
        "title": "Navy Polo Shirt",
        "description": "Classic pique polo in navy.",
        "price": 24.99,
        "cloth_type": "men",
        "category": "Shirts",
        "images": ["https://cdn.example.com/navy-polo.jpg"]
      }
    ]
  }
}
```

---

### Orders

#### `POST /api/store/order`

Places a new order (guest checkout). The client must generate and send a UUID `idempotency_key` to prevent duplicate orders on network retry.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `idempotency_key` | string (UUID) | ✅ Yes | Client-generated UUID; prevents duplicate orders on retry |
| `user_name` | string | ✅ Yes | Customer full name |
| `user_phone` | string | ✅ Yes | Customer phone number |
| `address` | string | ✅ Yes | Delivery address |
| `items` | array | ✅ Yes | Array of order line items |
| `items[].product_id` | string | ✅ Yes | Product UUID |
| `items[].quantity` | number | ✅ Yes | Quantity ordered |
| `items[].price` | number | ✅ Yes | Unit price at time of order |
| `coupon_code` | string | ❌ No | Discount coupon code to apply |

**Example Request**
```json
{
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
  "user_name": "Rasel Ahmed",
  "user_phone": "01800000000",
  "address": "Agrabad, Chittagong, Bangladesh",
  "items": [
    { "product_id": "prod-uuid-...", "quantity": 2, "price": 19.99 }
  ],
  "coupon_code": "SAVE10"
}
```

**Example Response** `201 Created`
```json
{
  "success": true,
  "data": {
    "order_id": "ORD-20260524-001",
    "user_name": "Rasel Ahmed",
    "total_payment": 35.98,
    "status": "pending"
  }
}
```

---

#### `GET /api/store/order/[order_id]`

Returns the public-facing status of an order. Returns only `user_name`, `total_payment`, and `status` — no sensitive internal data.

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `order_id` | ✅ Yes | Human-readable order ID e.g. `ORD-20260524-001` |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "user_name": "Rasel Ahmed",
    "total_payment": 35.98,
    "status": "shipped"
  }
}
```

---

### Coupons

#### `GET /api/store/coupon/[id]`

Validates and returns public coupon details. Returns `410 Gone` if the coupon is expired. Sensitive fields like `made_by` are stripped from the response.

**Path Parameter**

| Param | Required | Description |
|-------|----------|-------------|
| `id` | ✅ Yes | Coupon UUID |

**Example Response** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "coup-uuid-...",
    "code": "SAVE10",
    "discount_type": "percentage",
    "discount_value": 10,
    "expires_at": "2026-12-31T23:59:59.000Z"
  }
}
```

> **Possible error responses:**
> - `404` — Coupon not found
> - `410` — Coupon has expired

---

# Secret File Setting <div id="env">

Follow the **.env.local** file.

> - DATABASE_URL (postgresql)

> - NEXT_PUBLIC_SUPABASE_URL 

> - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

> - QDRANT_CLUSTER_ENDPOINT

> - QDRANT_CLUSTER_KEY

---
*Last updated: May 2026*
