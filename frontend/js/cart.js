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

  // Sticky Bar Elements
  const totalOldPriceEl = document.getElementById("totalOldPrice");
  const totalFinalPriceEl = document.getElementById("totalFinalPrice");
  const actionBar = document.querySelector(".cart-action-bar");

  if (!cartContainer) return; 

  const cart = getCart();
  cartContainer.innerHTML = "";

  // 1. Handle Empty State (Clean & Single)
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart-msg">
        <span class="icon">🛒</span>
        <h3>Your cart is empty!</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="../index.html" class="shop-now-btn">Start Shopping</a>
      </div>
    `;
    // Hide the sticky bar if cart is empty
    if (actionBar) actionBar.style.display = "none";
    return;
  }

  //Show the Sticky Bar if items exist
  if (actionBar) actionBar.style.display = "flex";


  let subtotal = 0;
  let originalTotal = 0;

  // 3. Render Items
  cart.forEach(item => {
    subtotal += item.price * item.qty;

    // Calculate what the price would have been without the discount
    originalTotal += (item.oldPrice || item.price) * item.qty;

    // --- Generate Star Ratings ---
    let stars = "";
    if (item.ratings) {
      const fullStars = Math.floor(item.ratings);
      const halfStar = item.ratings % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      stars = `
        <div class="rating">
          ${'★'.repeat(fullStars)}${halfStar ? '½' : ''}${'☆'.repeat(emptyStars)}
          <span style="color: #878787; font-size: 0.8rem;">(${item.ratings})</span>
        </div>`;
    }
    
    const div = document.createElement("div");
    div.className = "cart-item";
    // Detailed Structure using Product Page Classes
    div.innerHTML = `
       <img src="${item.images?.[0] || '/assets/images/no-image.png'}" class="cart-img" 
       onclick="window.location.href='../pages/product.html?id=${item._id}'" style="cursor:pointer"  onerror="this.src='/assets/images/no-image.png'">

      <div class="cart-info">
        <h3 onclick="window.location.href='../pages/product.html?id=${item._id}'" style="cursor:pointer" class="product-title">${item.name}</h3>
        
        ${stars}

        <div class="price-row" >
          <span class="price">${formatINR(item.price)}</span>
          ${item.oldPrice ? `<span class="old-price" style="text-decoration: line-through; color: #878787; margin-left: 8px;">${formatINR(item.oldPrice)}</span>` : ''}
          ${item.discount ? `<span class="discount" style="color: #388e3c; font-weight: 600; margin-left: 8px;">${item.discount}% OFF</span>` : ''}
        </div>

        <button class="remove-btn" style="margin-top: 15px; text-transform: uppercase;">
           Remove
        </button>
      </div>

      <div class="qty-control">
        <button class="decrease">-</button>
        <input type="number" class="qty-input" value="${item.qty}" min="1">
        <button class="increase">+</button>
      </div>
    `;

   // --- MODERN APPROACH: addEventListener ---
    div.querySelector(".increase").addEventListener("click", () => {
      changeQty(item._id, 1);
    });

    div.querySelector(".decrease").addEventListener("click", () => {
      changeQty(item._id, -1);
    });

    div.querySelector(".remove-btn").addEventListener("click", () => {
      removeItem(item._id);
    });

    div.querySelector(".qty-input").addEventListener("change", (e) => {
      updateQtyInput(item._id, e.target.value);
    });
    
    cartContainer.appendChild(div);
  });

  // 4. Calculations & Final Summary
  let delivery = subtotal > 500 ? 0 : 40;
  let grandTotal = subtotal + delivery;


  if (totalPriceEl) {
  totalPriceEl.innerHTML = `
    <div style="font-size: 1rem; color: #212121; display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Price (${cart.length} items)</span>
        <span>${formatINR(subtotal)}</span>
    </div>
    <div style="font-size: 1rem; color: #212121; display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Delivery Charges</span>
        <span>${delivery === 0 ? '<span style="color:#388e3c">FREE</span>' : formatINR(delivery)}</span>
    </div>
    <hr style="border:0; border-top:1px dashed #e0e0e0; margin:15px 0;">
    <div style="font-size: 1.2rem; font-weight:bold; display: flex; justify-content: space-between; color: #212121;">
        <span>Total Amount</span>
        <span>${formatINR(grandTotal)}</span>
    </div>
    <div style="color: #388e3c; font-weight: 600; font-size: 0.9rem; margin-top: 10px; text-align: left;">
        You will save ${formatINR(delivery === 0 ? 40 : 0)} on this order
    </div>
  `;
  }

// Update the Sticky Action Bar
   if (totalOldPriceEl && totalFinalPriceEl) {
    totalOldPriceEl.innerHTML = originalTotal > subtotal ? `<del style="color:#878787; font-size:0.9rem;">${formatINR(originalTotal + delivery)}</del>` : "";
    totalFinalPriceEl.textContent = formatINR(grandTotal);
  }

  // 6. REDIRECT TO CHECKOUT PAGE
  const placeOrderBtn = document.querySelector(".btn-checkout");
  if (placeOrderBtn) {
    placeOrderBtn.onclick = () => {
      window.location.href = "checkout.html";
    };
  }



 

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



document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadCart();
});