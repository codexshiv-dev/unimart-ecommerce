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
          await CartState.addItem(Normalize.product(product), 1);
          window.showToast?.("Added to cart");
          window.updateCartBadge?.();

          // Clear success state: button becomes an explicit "go to cart"
          // action instead of silently returning to "Add to Cart" (which
          // invited repeat clicks to stack quantity by accident).
          btnCart.textContent = "Go to Cart";
          btnCart.disabled = false;
          btnCart.onclick = () => { window.location.href = UniMartConfig.getPath("pages/cart.html"); };
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

