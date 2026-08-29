/**
 * UNiMART — Checkout page (pages/checkout.html).
 * Calls CheckoutService (POST /api/checkout) only. No price or total is
 * ever computed here for submission - they're shown for the customer's
 * benefit, but the server independently resolves the real values.
 *
 * Order success is determined ENTIRELY by the backend response. WhatsApp is
 * an optional follow-up action offered after success, never a precondition
 * for the order being considered placed.
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

// Pre-fills what the account already reliably has (name, phone) for a
// logged-in customer - address is never pre-filled, since it isn't part of
// the current User model. The customer can still edit any field.
function prefillFromAccount() {
  if (!AuthState.isLoggedIn()) return;
  const user = AuthState.getUser();
  const nameEl = document.getElementById("userName");
  const phoneEl = document.getElementById("userPhone");
  if (nameEl && user.name && !nameEl.value) nameEl.value = user.name;
  if (phoneEl && user.phone && !phoneEl.value) phoneEl.value = user.phone;
}

function validateNepaliPhone(phone) {
  return /^(98|97)\d{8}$/.test(phone.replace(/\s+/g, ""));
}

// ---- Inline field validation ----
function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add("invalid");
  errorEl.textContent = message;
  errorEl.classList.add("show");
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove("invalid");
  errorEl.classList.remove("show");
}

// Clears a field's invalid state as soon as the customer starts fixing it.
function wireLiveValidationClear(inputEl, errorEl) {
  inputEl.addEventListener("input", () => clearFieldError(inputEl, errorEl));
}

// Returns {valid, values} - validates all three fields, applies inline
// errors, and focuses the first invalid field, per the required UX.
function validateForm() {
  const nameEl = document.getElementById("userName");
  const phoneEl = document.getElementById("userPhone");
  const addressEl = document.getElementById("userAddress");
  const nameError = document.getElementById("errorName");
  const phoneError = document.getElementById("errorPhone");
  const addressError = document.getElementById("errorAddress");

  [[nameEl, nameError], [phoneEl, phoneError], [addressEl, addressError]].forEach(
    ([el, errEl]) => clearFieldError(el, errEl)
  );

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const address = addressEl.value.trim();

  let firstInvalid = null;

  if (!name) {
    setFieldError(nameEl, nameError, "Please enter your full name");
    firstInvalid = firstInvalid || nameEl;
  }
  if (!validateNepaliPhone(phone)) {
    setFieldError(phoneEl, phoneError, "Enter a valid number (98xxxxxxxx or 97xxxxxxxx)");
    firstInvalid = firstInvalid || phoneEl;
  }
  if (!address) {
    setFieldError(addressEl, addressError, "Please enter your delivery address");
    firstInvalid = firstInvalid || addressEl;
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return { valid: false };
  }

  return { valid: true, values: { name, phone, address } };
}

// ---- Success state - WhatsApp is optional, shown only after real backend success ----
function showOrderConfirmation(order) {
  const container = document.querySelector(".checkout-container");
  const mobileBar = document.querySelector(".mobile-bottom-bar");
  const mobileHeader = document.querySelector(".checkout-header-mobile");
  if (mobileBar) mobileBar.style.display = "none";
  if (mobileHeader) mobileHeader.style.display = "none";
  if (!container) return;

  container.innerHTML = `
    <div class="order-confirmation">
      <div class="confirm-icon">✅</div>
      <h2>Order Placed Successfully</h2>
      <p>Order ID: <strong>${order.orderId}</strong></p>
      <p>We'll contact you shortly to confirm delivery details.</p>
      <p>Would you like to send the order details to WhatsApp?</p>
      <div class="confirmation-actions">
        ${AuthState.isLoggedIn() ? `<a href="${UniMartConfig.getPath(`pages/orders.html?id=${order._id}`)}" class="shop-now-btn">View Order</a>` : ""}
        <button id="sendWhatsappBtn" class="btn-continue">Send on WhatsApp</button>
        <a href="${UniMartConfig.getPath("index.html")}" class="shop-now-btn">Continue Shopping</a>
      </div>
    </div>
  `;

  document.getElementById("sendWhatsappBtn")?.addEventListener("click", () => {
    const message = encodeURIComponent(
      `Hi, I just placed order ${order.orderId} on Unimart. Total: ${formatINR(order.totalAmount)}`
    );
    window.open(`https://wa.me/9779700013011?text=${message}`, "_blank");
    // Nothing about order status depends on what happens in this window -
    // the order was already confirmed by the backend before this button
    // even existed.
  });
}

async function submitOrder() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  const mobileBtn = document.getElementById("mobileCheckoutBtn");
  const overlay = document.getElementById("orderOverlay");

  const { valid, values } = validateForm();
  if (!valid) return;
  const { name, phone, address } = values;

  if (!AuthState.isLoggedIn() && cartItemsCache.length === 0) {
    window.showToast?.("Your cart couldn't be loaded. Please refresh the page and try again.");
    return;
  }

  // Duplicate-submission guard: disable both buttons for the duration of
  // the request, so a double-tap (or hitting desktop + mobile controls)
  // can't fire two requests.
  [checkoutBtn, mobileBtn].forEach((btn) => {
    if (btn) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = "Placing order...";
    }
  });
  if (overlay) overlay.style.display = "flex";

  try {
    const contact = { customerName: name, customerPhone: phone, customerAddress: address, paymentMethod: "WhatsApp" };

    // Guest checkout must submit items directly - the server has no cart
    // record for a guest. Logged-in checkout omits items entirely; the
    // server reads the authenticated user's stored Cart instead.
    const items = AuthState.isLoggedIn()
      ? undefined
      : cartItemsCache.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    const order = await CheckoutService.placeOrder(contact, items);

    // Order is confirmed the moment this line is reached - everything after
    // this point is cleanup/UI, not a condition for the order's validity.
    await CartState.clearCart();
    window.updateCartBadge?.();

    if (overlay) overlay.style.display = "none";
    showOrderConfirmation(order);
  } catch (error) {
    if (overlay) overlay.style.display = "none";
    window.showToast?.(error.message || "Could not place your order. Please try again.");
    [checkoutBtn, mobileBtn].forEach((btn) => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Button listeners attach unconditionally, before anything that could
  // fail - a failure loading the cart summary must never leave the button
  // dead with no explanation.
  document.getElementById("checkoutBtn")?.addEventListener("click", submitOrder);
  document.getElementById("mobileCheckoutBtn")?.addEventListener("click", submitOrder);

  const nameEl = document.getElementById("userName");
  const phoneEl = document.getElementById("userPhone");
  const addressEl = document.getElementById("userAddress");
  wireLiveValidationClear(nameEl, document.getElementById("errorName"));
  wireLiveValidationClear(phoneEl, document.getElementById("errorPhone"));
  wireLiveValidationClear(addressEl, document.getElementById("errorAddress"));

  try {
    if (window.AuthState && !AuthState.initialized) {
      await AuthState.init();
    }
    prefillFromAccount();
    await renderSummary();
  } catch (error) {
    window.showToast?.(error.message || "Could not load your cart. Please refresh and try again.");
  }
});
