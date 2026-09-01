/**
 * UNiMART Admin — Category service. Wraps GET/POST/PUT/DELETE
 * /api/categories exactly as implemented in
 * backend/controllers/categoryController.js.
 */
const AdminCategoryService = {
  // GET /api/categories -> { success, count, data: Category[] }
  getAll: () => AdminApiClient.get(AdminConfig.getUrl("categories")),

  // GET /api/categories/:id -> { success, data: Category }
  getById: (id) => AdminApiClient.get(AdminConfig.getUrl("categories", `/${id}`)),

  // POST /api/categories { name } -> { success, data: Category }
  create: (name) => AdminApiClient.post(AdminConfig.getUrl("categories"), { name }),

  // PUT /api/categories/:id { name } -> { success, data: Category }
  update: (id, name) => AdminApiClient.put(AdminConfig.getUrl("categories", `/${id}`), { name }),

  // DELETE /api/categories/:id -> { success, message } or 409 if products
  // still reference it (backend enforces this, we just surface the message)
  remove: (id) => AdminApiClient.delete(AdminConfig.getUrl("categories", `/${id}`)),
};

window.AdminCategoryService = AdminCategoryService;
