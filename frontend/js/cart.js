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

// ADD TO CART (GLOBAL)
function addToCart(product, qty = 1) {
  const cart = getCart();

  const existing = cart.find(item => item._id === product._id);

  if (existing) {
    existing.qty += qty;
  } else {
    // cart.push({
    //   _id: product._id,
    //   name: product.name,
    //   price: product.price,
    //   images: product.images,
    //   qty: qty
    // });
     cart.push({ ...product, qty });
  }

  saveCart(cart);
  // updateCartCount();
  showToast("Added to cart ✅");
}

// UPDATE CART COUNT
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);

  const el = document.getElementById("cartCount");
  if (el) el.textContent = total;
}

// RENDER CART PAGE
function loadCart() {
  const cartContainer = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");

  if (!cartContainer) return; // only run on cart page

  const cart = getCart();
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 🛒</p>";
    totalPriceEl.innerText = "Total: ₹0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";
  //  <img src="${item.images?.[0] || '../assets/images/no-image.png'}" class="cart-img"></img>
    div.innerHTML = `
      
      <img src="${item.images?.[0] || 'https://via.placeholder.com/150'}" class="cart-img">

      <div class="cart-info">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>

        <div class="qty-control">
          <button class="decrease">-</button>
          <span>${item.qty}</span>
          <button class="increase">+</button>
        </div>

        <button class="remove-btn">Remove</button>
      </div>
    `;

    // ✅ NO inline onclick (better practice)
    div.querySelector(".increase").onclick = () => changeQty(item._id, 1);
    div.querySelector(".decrease").onclick = () => changeQty(item._id, -1);
    div.querySelector(".remove-btn").onclick = () => removeItem(item._id);

    cartContainer.appendChild(div);
  });

  totalPriceEl.innerText = "Total: ₹" + total;
}

// =====================
// CHANGE QUANTITY
// =====================
function changeQty(id, change) {
  let cart = getCart();

  cart = cart.map(item => {
    if (item._id === id) {
      item.qty += change;
      if (item.qty < 1) item.qty = 1;
    }
    return item;
  });

  saveCart(cart);
  loadCart();
  updateCartCount();
}

// =====================
// REMOVE ITEM
// =====================
function removeItem(id) {
  let cart = getCart();

  cart = cart.filter(item => item._id !== id);

  saveCart(cart);
  loadCart();
  updateCartCount();
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadCart();
});

//add whatsapp order funciton;
function checkoutWhatsApp() {
  const cart = getCart();

  let message = "🛒 Order Details:\n\n";

  cart.forEach(item => {
    message += `${item.name} x ${item.qty} = ₹${item.price * item.qty}\n`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  message += `\nTotal: ₹${total}`;

  const phone = "977XXXXXXXXXX"; // your number
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}