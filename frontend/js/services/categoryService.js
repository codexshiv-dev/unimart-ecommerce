const CategoryService = {
  getCategories: async () => {
    const res = await ApiClient.get(UniMartConfig.getUrl("categories"));
    return res?.data || [];
  },
};

window.CategoryService = CategoryService;
