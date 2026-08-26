/**
 * Checkout service. Calls POST /api/checkout only - the removed
 * POST /api/orders must never be referenced anywhere in the frontend.
 * Never sends a price or total - the server resolves those.
 */
const CheckoutService = {
  // contact: {customerName, customerPhone, customerAddress, paymentMethod}
  // items: [{productId, quantity}] - REQUIRED for guest checkout, ignored by
  // the server for a logged-in user (server reads their stored Cart instead).
  placeOrder: async (contact, items) => {
    const payload = { ...contact };
    if (items) payload.items = items;
    const res = await ApiClient.post(UniMartConfig.getUrl("checkout"), payload);
    return res?.data || null;
  },
};

window.CheckoutService = CheckoutService;
