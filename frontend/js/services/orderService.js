const OrderService = {
  getMyOrders: () => ApiClient.get(UniMartConfig.getUrl("orders", "/mine")),
  getMyOrderById: (id) => ApiClient.get(UniMartConfig.getUrl("orders", `/mine/${id}`)),
  cancelMyOrder: (id) => ApiClient.patch(UniMartConfig.getUrl("orders", `/mine/${id}/cancel`)),
};

window.OrderService = OrderService;
