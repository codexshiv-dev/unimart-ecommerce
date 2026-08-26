const CartService = {
  getCart: async () => {
    const res = await ApiClient.get(UniMartConfig.getUrl("cart"));
    return res?.data?.items || [];
  },

  addItem: async (productId, quantity = 1) => {
    const res = await ApiClient.post(UniMartConfig.getUrl("cartItem"), { productId, quantity });
    return res?.data?.items || [];
  },

  updateItemQuantity: async (productId, quantity) => {
    const res = await ApiClient.put(UniMartConfig.getUrl("cartItem", `/${productId}`), { quantity });
    return res?.data?.items || [];
  },

  removeItem: async (productId) => {
    const res = await ApiClient.delete(UniMartConfig.getUrl("cartItem", `/${productId}`));
    return res?.data?.items || [];
  },

  clearCart: async () => {
    const res = await ApiClient.delete(UniMartConfig.getUrl("cart"));
    return res?.data?.items || [];
  },

  // items: [{productId, quantity}] - the guest cart being merged in on login
  syncCart: async (items) => {
    const res = await ApiClient.post(UniMartConfig.getUrl("cartSync"), { items });
    return res?.data?.items || [];
  },
};

window.CartService = CartService;
