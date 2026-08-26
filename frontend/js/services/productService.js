/**
 * Product service. getProducts() now delegates search/filtering/pagination
 * to the backend (which already supports page/limit/category/search/
 * minPrice/maxPrice) instead of downloading every product and filtering in
 * the browser.
 */
const ProductService = {
  // params: { page, limit, category, search, onlyActive }
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const url = `${UniMartConfig.getUrl("products")}?${query.toString()}`;
    return ApiClient.get(url); // { success, count, pagination, data }
  },

  getProductById: async (id) => {
    const res = await ApiClient.get(UniMartConfig.getUrl("products", `/${id}`));
    return res?.data || null;
  },
};

window.ProductService = ProductService;
