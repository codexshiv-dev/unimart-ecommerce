/**
 * UNiMART Admin — Product service. Wraps /api/products exactly as
 * implemented in backend/controllers/productController.js.
 */
const AdminProductService = {
  // GET /api/products?search=&category=&minPrice=&maxPrice=&page=&limit=&onlyActive=
  // -> { success, count, pagination: { totalItems, totalPages, currentPage, limit }, data: Product[] }
  // `category` here is the category's slug (backend resolves it internally),
  // not the ObjectId - matches how the storefront already filters.
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const qs = query.toString();
    return AdminApiClient.get(AdminConfig.getUrl("products", qs ? `?${qs}` : ""));
  },

  // GET /api/products/:id -> { success, data: Product }
  getById: (id) => AdminApiClient.get(AdminConfig.getUrl("products", `/${id}`)),

  // POST /api/products -> { success, data: Product }
  // payload: { name, description, category, price, oldPrice, stockQuantity,
  //            images: [{url, publicId}], tags, sku }
  create: (payload) => AdminApiClient.post(AdminConfig.getUrl("products"), payload),

  // PUT /api/products/:id -> { success, data: Product }
  update: (id, payload) => AdminApiClient.put(AdminConfig.getUrl("products", `/${id}`), payload),

  // DELETE /api/products/:id -> { success, message } or 409 if status is
  // still "active" (backend requires deactivating first)
  remove: (id) => AdminApiClient.delete(AdminConfig.getUrl("products", `/${id}`)),
};

window.AdminProductService = AdminProductService;
