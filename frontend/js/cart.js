// =====================
// CART STORAGE HELPERS
// =====================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Professional Currency Formatter
function formatINR(amount) {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  });
}

// ADD TO CART (Used on Product Pages)
function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item._id === product._id);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }

  saveCart(cart);
  if (typeof showToast === "function") showToast("Added to cart ✅");
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}

// =====================
// RENDER CART PAGE
// =====================
function loadCart() {
  const cartContainer = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  const shippingForm = document.getElementById("shippingForm");
  const paymentMethod = document.getElementById("paymentMethod"); // Future proof ID
  const summaryDiv = document.querySelector(".cart-summary");

  if (!cartContainer) return; 

  const cart = getCart();
  cartContainer.innerHTML = "";

  // 1. Handle Empty State (Clean & Single)
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart-msg">
        <span class="icon" style="font-size: 3rem; display: block; margin-bottom: 10px;">🛒</span>
        <h3>Your cart is empty!</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="index.html" class="shop-now-btn">Start Shopping</a>
      </div>
    `;
    if(summaryDiv) summaryDiv.style.display = "none";
    if(shippingForm) shippingForm.style.display = "none";
    if (paymentMethod) paymentMethod.style.display = "none";
    return;
  }

  // 2. Show UI Elements
  if(summaryDiv) summaryDiv.style.display = "flex";
  if(shippingForm) shippingForm.style.display = "block";
  if (paymentMethod) paymentMethod.style.display = "block";


  let subtotal = 0;

  // 3. Render Items
  cart.forEach(item => {
    subtotal += item.price * item.qty;
    
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.images?.[0] || 'placeholder.png'}" class="cart-img" onerror="this.src='https://via.placeholder.com/150'">
      <div class="cart-info">
        <h3>${item.name}</h3>
        <p class="price">${formatINR(item.price)}</p>
        <button class="remove-btn">Remove</button>
      </div>
      <div class="qty-control">
        <button class="decrease">-</button>
        <input type="number" class="qty-input" value="${item.qty}" min="1">
        <button class="increase">+</button>
      </div>
    `;

    // Modern Event Listeners (No duplicate inline attributes)
    div.querySelector(".increase").onclick = () => changeQty(item._id, 1);
    div.querySelector(".decrease").onclick = () => changeQty(item._id, -1);
    div.querySelector(".remove-btn").onclick = () => removeItem(item._id);
    div.querySelector(".qty-input").onchange = (e) => updateQtyInput(item._id, e.target.value);

    cartContainer.appendChild(div);
  });

  // 4. Calculations & Final Summary
  let delivery = subtotal > 500 ? 0 : 40;
  let grandTotal = subtotal + delivery;

  totalPriceEl.innerHTML = `
    <div style="font-size: 0.9rem; color: #666; text-align: right;">Subtotal: ${formatINR(subtotal)}</div>
    <div style="font-size: 0.9rem; color: #666; text-align: right;">Delivery: ${delivery === 0 ? '<span style="color:green">FREE</span>' : formatINR(delivery)}</div>
    <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
    <div style="font-size: 1.4rem; font-weight:bold; text-align: right;">Total: ${formatINR(grandTotal)}</div>
  `;
}

// =====================
// UPDATING HELPERS
// =====================
function changeQty(id, change) {
  let cart = getCart();
  cart = cart.map(item => {
    if (item._id === id) {
      item.qty = Math.max(1, item.qty + change);
    }
    return item;
  });
  saveCart(cart);
  loadCart();
}

function updateQtyInput(id, value) {
  let val = parseInt(value);
  if (isNaN(val) || val < 1) val = 1;
  let cart = getCart();
  cart = cart.map(item => {
    if (item._id === id) item.qty = val;
    return item;
  });
  saveCart(cart);
  loadCart();
}

function removeItem(id) {
  if (confirm("Are you sure you want to remove this item?")) {
    let cart = getCart().filter(item => item._id !== id);
    saveCart(cart);
    loadCart();
  }
}

// =====================
// CHECKOUT
// =====================
function handleCheckout() {
  const nameInput = document.getElementById("userName");
  const addressInput = document.getElementById("userAddress");
 
  // Validation for Inputs
  const name = nameInput ? nameInput.value.trim() : "";
  const address = addressInput ? addressInput.value.trim() : "";

  if (!name || !address) {
    alert("Please enter your name and address for delivery! 🚚");
    return;
  }

  // Payment Method Selection
 const paymentEl = document.querySelector('input[name="payment"]:checked');
 const selectedPayment = paymentEl ? paymentEl.value : "whatsapp";

  if (selectedPayment === "esewa") {
    alert("eSewa payment is being integrated! Please use WhatsApp for now. 🙏");
    return;
  }

  // --- NEW: SHOW THANK YOU OVERLAY ---
  const overlay = document.getElementById("orderOverlay");
  if (overlay) overlay.style.display = "flex";

  // WHATSAPP ORDER LOGIC
  const cart = getCart();
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let delivery = subtotal > 500 ? 0 : 40;
  let total = subtotal + delivery;

 let message = `*✨ NEW ORDER RECEIVED ✨*\n`;
  message += `--------------------------\n`;
  message += `👤 *Customer:* ${name}\n`;
  message += `📍 *Address:* ${address}\n`;
  message += `💳 *Payment:* WhatsApp (Manual)\n`;
  message += `--------------------------\n\n`;
  message += `*Items Ordered:* \n`;

  cart.forEach(item => {
    message += `▪️ ${item.name} (x${item.qty}) - ${formatINR(item.price * item.qty)}\n`;
  });


  message += `\n--------------------------\n`;
  message += `💰 *Subtotal:* ${formatINR(subtotal)}\n`;
  message += `🚚 *Delivery:* ${delivery === 0 ? 'FREE' : formatINR(delivery)}\n`;
  message += `✅ *TOTAL AMOUNT:* ${formatINR(total)}\n`;
  message += `--------------------------\n`;
  message += `_Please confirm my order!_`;

  const phone = "977XXXXXXXx"; 
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Wait 2 seconds so the user sees the "Processing" screen, then redirect
  setTimeout(() => {
    window.open(url, "_blank");
    
    // Optional: Clear the cart after redirecting
    // localStorage.removeItem("cart");
    // location.reload(); 
    
    if (overlay) overlay.style.display = "none";
  }, 2000);


  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadCart();
});