/**
 * UNiMART — Checkout page (pages/checkout.html).
 * Calls CheckoutService (POST /api/checkout) only. No price or total is
 * ever computed here for submission - they're shown for the customer's
 * benefit, but the server independently resolves the real values.
 */
function formatINR(amount) {
  return Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  });
}

let cartItemsCache = [];

async function renderSummary() {
  const summaryBox = document.getElementById("priceSummary");
  const mobileTotal = document.getElementById("mobileTotalAmount");

  cartItemsCache = await CartState.getItems();

  if (cartItemsCache.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  const subtotal = cartItemsCache.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + delivery;

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-line"><span>Price (${cartItemsCache.length} items)</span><span>${formatINR(subtotal)}</span></div>
      <div class="summary-line"><span>Delivery Charges</span><span>${delivery === 0 ? '<span class="free">FREE</span>' : formatINR(delivery)}</span></div>
      <hr>
      <div class="summary-line total"><span>Total Amount</span><span>${formatINR(total)}</span></div>
    `;
  }
  if (mobileTotal) mobileTotal.textContent = formatINR(total);

  return total;
}

function validateNepaliPhone(phone) {
  return /^(98|97)\d{8}$/.test(phone.replace(/\s+/g, ""));
}

function showOrderConfirmation(order) {
  const container = document.querySelector(".checkout-container");
  const mobileBar = document.querySelector(".mobile-bottom-bar");
  const mobileHeader = document.querySelector(".checkout-header-mobile");
  if (mobileBar) mobileBar.style.display = "none";
  if (mobileHeader) mobileHeader.style.display = "none";

  if (container) {
    container.innerHTML = `
      <div class="order-confirmation">
        <div class="confirm-icon">✅</div>
        <h2>Order Placed!</h2>
        <p>Your order <strong>${order.orderId}</strong> has been received.</p>
        <p>We'll contact you shortly to confirm delivery details.</p>
        <a href="${UniMartConfig.getPath("index.html")}" class="shop-now-btn">Continue Shopping</a>
      </div>
    `;
  }
}

async function submitOrder() {
  console.log("[DEBUG] submitOrder fired"); // TEMPORARY - remove after diagnosis

  const checkoutBtn = document.getElementById("checkoutBtn");
  const mobileBtn = document.getElementById("mobileCheckoutBtn");
  const overlay = document.getElementById("orderOverlay");

  const nameEl = document.getElementById("userName");
  const phoneEl = document.getElementById("userPhone");
  const addressEl = document.getElementById("userAddress");
  console.log("[DEBUG] form elements found:", { nameEl, phoneEl, addressEl }); // TEMPORARY

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const address = addressEl.value.trim();

  if (!name) { console.log("[DEBUG] validation failed: name"); return window.showToast?.("Please enter your name"); }
  if (!validateNepaliPhone(phone)) { console.log("[DEBUG] validation failed: phone", phone); return window.showToast?.("Please enter a valid WhatsApp number (98xxxxxxxx or 97xxxxxxxx)"); }
  if (!address) { console.log("[DEBUG] validation failed: address"); return window.showToast?.("Please enter your delivery address"); }
  console.log("[DEBUG] validation passed. isLoggedIn:", AuthState.isLoggedIn(), "cartItemsCache.length:", cartItemsCache.length); // TEMPORARY
  if (!AuthState.isLoggedIn() && cartItemsCache.length === 0) {
    console.log("[DEBUG] blocked: guest with empty cartItemsCache"); // TEMPORARY
    return window.showToast?.("Your cart couldn't be loaded. Please refresh the page and try again.");
  }

  // Idempotency interim fix: disable both submit buttons for the duration
  // of the request, so a double-tap can't fire two checkout requests.
  [checkoutBtn, mobileBtn].forEach((btn) => { if (btn) { btn.disabled = true; btn.dataset.originalText = btn.textContent; btn.textContent = "Placing order..."; } });
  if (overlay) overlay.style.display = "flex";

  try {
    const contact = { customerName: name, customerPhone: phone, customerAddress: address, paymentMethod: "WhatsApp" };

    // Guest checkout must submit items directly - the server has no cart
    // record for a guest. Logged-in checkout omits items entirely; the
    // server reads the authenticated user's stored Cart instead.
    const items = AuthState.isLoggedIn()
      ? undefined
      : cartItemsCache.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    console.log("[DEBUG] calling CheckoutService.placeOrder with:", { contact, items }); // TEMPORARY
    const order = await CheckoutService.placeOrder(contact, items);
    console.log("[DEBUG] placeOrder resolved:", order); // TEMPORARY

    await CartState.clearCart();
    window.updateCartBadge?.();

    const whatsappMessage = encodeURIComponent(
      `Hi, I just placed order ${order.orderId} on Unimart. Total: ${formatINR(order.totalAmount)}`
    );

    if (overlay) overlay.style.display = "none";
    showOrderConfirmation(order);
    window.open(`https://wa.me/9779700013011?text=${whatsappMessage}`, "_blank");
  } catch (error) {
    console.log("[DEBUG] placeOrder threw:", error); // TEMPORARY
    if (overlay) overlay.style.display = "none";
    window.showToast?.(error.message || "Could not place your order. Please try again.");
    [checkoutBtn, mobileBtn].forEach((btn) => { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalText; } });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const checkoutBtnEl = document.getElementById("checkoutBtn");
  const mobileBtnEl = document.getElementById("mobileCheckoutBtn");
  console.log("[DEBUG] buttons found at load:", { checkoutBtnEl, mobileBtnEl }); // TEMPORARY

  checkoutBtnEl?.addEventListener("click", submitOrder);
  mobileBtnEl?.addEventListener("click", submitOrder);
  console.log("[DEBUG] listeners attached"); // TEMPORARY

  try {
    if (window.AuthState && !AuthState.initialized) {
      await AuthState.init();
    }
    await renderSummary();
  } catch (error) {
    window.showToast?.(error.message || "Could not load your cart. Please refresh and try again.");
  }
});
