/**
 * UNiMART — Product detail page (product.html).
 * Related products now request the backend's own category filter
 * (?category=slug&limit=6) instead of fetching the entire catalog and
 * filtering client-side.
 */
(() => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const btnCart = document.getElementById("btnCart");
  const whatsappBtn = document.getElementById("whatsappBtn");

  const loadRelated = async (product) => {
    const slug = Normalize.getCategorySlug(product);
    if (!slug) {
      window.renderRelatedProducts?.([]);
      return;
    }
    try {
      const res = await ProductService.getProducts({ category: slug, limit: 7, onlyActive: true });
      const related = (res?.data || []).filter((p) => p._id !== product._id).slice(0, 6);
      window.renderRelatedProducts?.(related);
    } catch (error) {
      window.renderRelatedProducts?.([]);
    }
  };

  const init = async () => {
    if (!productId) {
      window.location.href = UniMartConfig.getPath("index.html");
      return;
    }

    let product;
    try {
      product = await ProductService.getProductById(productId);
    } catch (error) {
      product = null;
    }

    if (!product) {
      window.showToast?.("Product not found");
      setTimeout(() => (window.location.href = UniMartConfig.getPath("index.html")), 1200);
      return;
    }

    document.title = `${product.name} - Unimart`;

    window.renderGallery?.(product);
    window.renderProductInfo?.(product);
    window.renderStockInfo?.(product);
    window.renderTags?.(product);
    window.renderRibbons?.(product);
    window.renderRating?.(product);
    loadRelated(product);

    const isUnavailable = product.status !== "active";
    const stockLimit = Math.max(1, product.stockQuantity || 1);
    let quantity = 1;

    const qtyValueEl = document.getElementById("qtyValue");
    const qtyMinusBtn = document.getElementById("qtyMinus");
    const qtyPlusBtn = document.getElementById("qtyPlus");

    const renderQty = () => {
      if (qtyValueEl) qtyValueEl.textContent = quantity;
      if (qtyMinusBtn) qtyMinusBtn.disabled = quantity <= 1;
      if (qtyPlusBtn) qtyPlusBtn.disabled = quantity >= stockLimit;
    };
    qtyMinusBtn?.addEventListener("click", () => { if (quantity > 1) { quantity--; renderQty(); } });
    qtyPlusBtn?.addEventListener("click", () => { if (quantity < stockLimit) { quantity++; renderQty(); } });
    renderQty();

    // If this product is already in the cart, reflect that immediately
    // instead of showing "Add to Cart" as though nothing happened yet.
    const setGoToCartState = () => {
      if (btnCart) {
        btnCart.textContent = "Go to Cart";
        btnCart.disabled = false;
        btnCart.onclick = () => { window.location.href = UniMartConfig.getPath("pages/cart.html"); };
      }
    };
    try {
      const existingItems = await CartState.getItems();
      const existing = existingItems.find((i) => i.productId === product._id);
      if (existing) {
        document.getElementById("qtySelector")?.classList.add("hidden");
        setGoToCartState();
      }
    } catch (error) {
      // Cart-state check failing shouldn't block the page - Add to Cart just
      // stays in its default state.
    }

    if (btnCart) {
      btnCart.disabled = isUnavailable;
      btnCart.textContent = isUnavailable ? "Unavailable" : "Add to Cart";

      let isSubmitting = false;
      btnCart.addEventListener("click", async () => {
        if (isUnavailable || isSubmitting) return;

        isSubmitting = true;
        btnCart.disabled = true;
        btnCart.textContent = "Adding...";

        try {
          await CartState.addItem(Normalize.product(product), quantity);
          window.showToast?.("Added to cart");
          window.updateCartBadge?.();
          document.getElementById("qtySelector")?.classList.add("hidden");
          setGoToCartState();
        } catch (error) {
          window.showToast?.(error.message || "Could not add to cart");
          btnCart.textContent = "Add to Cart";
          btnCart.disabled = false;
          isSubmitting = false;
        }
      });
    }

    if (whatsappBtn) {
      const message = encodeURIComponent(`Hi, I'm interested in "${product.name}" (₹${product.price})`);
      whatsappBtn.href = `https://wa.me/9779700013011?text=${message}`;
    }
  };

  document.addEventListener("DOMContentLoaded", init);
})();
