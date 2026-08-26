/**
 * UNiMART — Cart state. Guest cart lives in localStorage (fast, no login
 * required); logged-in cart lives on the server. Every page calls the same
 * functions here regardless of which mode is active - the branching happens
 * once, in this file, not scattered across cart.js/product.js/checkout.js.
 */
const CartState = (() => {
  const STORAGE_KEY = "unimart_guest_cart";

  const readGuestCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  };

  const writeGuestCart = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  // Normalizes both cart shapes (guest's flat snapshot vs server's
  // populated {product, quantity, available}) into one common shape pages
  // can render without caring which mode produced it.
  const normalizeServerItems = (serverItems) =>
    serverItems.map((item) => ({
      productId: item.product?._id,
      name: item.product?.name,
      price: item.product?.price,
      // oldPrice/discount/ratings are NOT included here - the server cart's
      // populate() doesn't select them yet. See integration notes: this is
      // a known, reported gap, not an oversight.
      image: Normalize.getImageUrl(item.product),
      quantity: item.quantity,
      available: item.available,
      stockQuantity: item.product?.stockQuantity,
    }));

  const getItems = async () => {
    if (AuthState.isLoggedIn()) {
      const serverItems = await CartService.getCart();
      return normalizeServerItems(serverItems);
    }
    return readGuestCart();
  };

  const getCount = async () => {
    const items = await getItems();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // `product` here is a normalized product (has _id, name, price, imageUrl)
  const addItem = async (product, quantity = 1) => {
    if (AuthState.isLoggedIn()) {
      const serverItems = await CartService.addItem(product._id, quantity);
      return normalizeServerItems(serverItems);
    }

    const items = readGuestCart();
    const existing = items.find((i) => i.productId === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        ratings: product.ratings,
        image: product.imageUrl || Normalize.getImageUrl(product),
        quantity,
      });
    }
    writeGuestCart(items);
    return items;
  };

  const updateQuantity = async (productId, quantity) => {
    if (AuthState.isLoggedIn()) {
      const serverItems = await CartService.updateItemQuantity(productId, quantity);
      return normalizeServerItems(serverItems);
    }
    const items = readGuestCart();
    const item = items.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
    writeGuestCart(items);
    return items;
  };

  const removeItem = async (productId) => {
    if (AuthState.isLoggedIn()) {
      const serverItems = await CartService.removeItem(productId);
      return normalizeServerItems(serverItems);
    }
    const items = readGuestCart().filter((i) => i.productId !== productId);
    writeGuestCart(items);
    return items;
  };

  const clearCart = async () => {
    if (AuthState.isLoggedIn()) {
      await CartService.clearCart();
    }
    writeGuestCart([]);
  };

  // Called right after a successful login. Merges the guest cart into the
  // server cart, then empties localStorage - the server cart becomes the
  // single source of truth from this point on.
  const syncGuestCartToServer = async () => {
    const guestItems = readGuestCart();
    if (guestItems.length === 0) return;

    const payload = guestItems.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    await CartService.syncCart(payload);
    writeGuestCart([]);
  };

  return { getItems, getCount, addItem, updateQuantity, removeItem, clearCart, syncGuestCartToServer };
})();

window.CartState = CartState;
