// ==========================================================================
// 🚀 PRODUCTION CHECKOUT ENGINE
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    loadCheckoutCart();

    const checkoutBtn = document.getElementById("checkoutBtn");
    const mobileCheckoutBtn = document.getElementById("mobileCheckoutBtn");

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", handleCheckout);
    }

    if(mobileCheckoutBtn){
       mobileCheckoutBtn.addEventListener("click", handleCheckout);
    }
   
});

async function handleCheckout() {

    // UI Elements
    const nameInput = document.getElementById("userName");
    const addressInput = document.getElementById("userAddress");
    const phoneInput = document.getElementById("userPhone");
    const overlay = document.getElementById("orderOverlay");

 try {
    console.log("🚀 Checkout process initiated...");
    
    
   
    // 1. Basic Data Retrieval
    console.log("STEP 1");
    const name = nameInput?.value.trim();
    const address = addressInput?.value.trim();
    const phone = phoneInput?.value.trim();

    console.log("NAME:", name);
console.log("PHONE:", phone);
console.log("ADDRESS:", address);

console.log("STEP 2");
    const cart = (typeof getCart === "function") ? getCart() : [];

console.log("CART:", cart);

console.log("STEP 3");
    // 1. Validation using your new Toast System
    if (!name || !phone || !address) {
        return window.showToast("Please fill in all details! 🚚");
        
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^(98|97)\d{8}$/.test(cleanPhone)) {
       return  window.showToast("Enter a valid 10-digit Nepali number.");
        
    }

       if (!cart || cart.length === 0) {
        return window.showToast("Your cart is empty!", "warning");
        }

        if (!window.UniMartConfig) {
            throw new Error("UniMartConfig missing");
        }

    console.log("Validation OK");

    // 2. Calculations
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let delivery = subtotal > 500 ? 0 : 40;
    let total = subtotal + delivery;

    const orderPayload = {
        customerName: name,
        customerAddress: address,
        customerPhone: cleanPhone,
        paymentMethod: "WhatsApp",
        totalAmount: total,
        items: cart.map(item => ({
            productId: item._id || null,
            name: item.name,
            quantity: item.qty,
            price: item.price
        }))
    };

        // 3. Transmit to Backend
         if (overlay) overlay.style.display = "flex";

          console.log(
    "Order URL:",
    window.UniMartConfig.getEndpoint("orders")
     );

       const response = await fetch(
       window.UniMartConfig.getEndpoint("orders"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });
       

        if (!response.ok) throw new Error("Synchronization failed");

        const savedOrder = await response.json();

        // 4. Success Flow: WhatsApp Redirect
        window.showToast("Order placed successfully!", "success");
        
        let message = `*✨ NEW ORDER RECEIVED ✨*\n`;
        message += `📋 *ID:* #${savedOrder.orderId || 'Pending'}\n\n`;
        message += `👤 *Customer:* ${name}\n📞 *Phone:* 977${cleanPhone}\n📍 *Address:* ${address}\n\n`;
        message += `*📦 ITEMS:*\n`;
        cart.forEach(item => message += `- ${item.name} (x${item.qty})\n`);
        message += `\n*TOTAL: Rs. ${total}*`;

        localStorage.removeItem("cart"); // Clear cart after success
        if (window.updateCartCount) window.updateCartCount();

       const BUSINESS_WHATSAPP = "97798044069";

       setTimeout(() => {
           window.location.href =
               `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(message)}`;
       }, 1500);

    } catch (err) {
        console.error("Order Error:", err);
       window.showToast("System busy. Please try again later.", "error");
    } finally {
        if (overlay) overlay.style.display = "none";
    }
}


function loadCheckoutCart() {
    const cartData = localStorage.getItem("cart");
    const container = document.getElementById("priceSummary");
    const mobileTotal = document.getElementById("mobileTotalAmount");

    if (!cartData) return;

    const cart = JSON.parse(cartData);
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Define the delivery variable here!
    let delivery = subtotal > 500 ? 0 : 40; 
    let total = subtotal + delivery;

    if (container) {
        container.innerHTML = ""; 
        cart.forEach(item => {
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span>${item.name} (x${item.qty})</span>
                    <span>Rs. ${item.price * item.qty}</span>
                </div>`;
        });
        container.innerHTML += `<hr><div><strong>Total: Rs. ${total}</strong></div>`;
    }
    
    if (mobileTotal) mobileTotal.textContent = `Rs. ${total}`;
}