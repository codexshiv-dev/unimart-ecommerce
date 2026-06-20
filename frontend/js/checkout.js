// ==========================================================================
// 🚀 PRODUCTION CHECKOUT ENGINE
// ==========================================================================

async function handleCheckout() {
    const nameInput = document.getElementById("userName");
    const addressInput = document.getElementById("userAddress");
    const phoneInput = document.getElementById("userPhone");
    const overlay = document.getElementById("orderOverlay");
    
    const name = nameInput?.value.trim();
    const address = addressInput?.value.trim();
    const phone = phoneInput?.value.trim();

    // 1. Validation using your new Toast System
    if (!name || !phone || !address) {
        window.showToast("Please fill in all details! 🚚");
        return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^(98|97)\d{8}$/.test(cleanPhone)) {
        window.showToast("Enter a valid 10-digit Nepali number.");
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        window.showToast("Your cart is empty!");
        return;
    }

    // 2. Calculations
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let delivery = subtotal > 500 ? 0 : 40;
    let total = subtotal + delivery;

    const orderPayload = {
        orderId: "ORD-" + Date.now(),
        customerName: name,
        customerAddress: address,
        customerPhone: cleanPhone,
        paymentMethod: "WhatsApp (Manual)",
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

    try {
        const response = await fetch(`${window.UniMartConfig.BASE_URL}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) throw new Error("Synchronization failed");

        const savedOrder = await response.json();

        // 4. Success Flow: WhatsApp Redirect
        window.showToast("Order placed successfully! Redirecting...");
        
        let message = `*✨ NEW ORDER RECEIVED ✨*\n`;
        message += `📋 *ID:* #${savedOrder.orderId || 'Pending'}\n\n`;
        message += `👤 *Customer:* ${name}\n📞 *Phone:* 977${cleanPhone}\n📍 *Address:* ${address}\n\n`;
        message += `*📦 ITEMS:*\n`;
        cart.forEach(item => message += `- ${item.name} (x${item.qty})\n`);
        message += `\n*TOTAL: Rs. ${total}*`;

        localStorage.removeItem("cart"); // Clear cart after success
        if (window.updateCartCount) window.updateCartCount();

        setTimeout(() => {
            window.location.href = `https://wa.me/97798XXXXXXXX?text=${encodeURIComponent(message)}`;
        }, 1500);

    } catch (err) {
        console.error("Order Error:", err);
        window.showToast("System busy. Please try again!");
    } finally {
        if (overlay) overlay.style.display = "none";
    }
}
// Add this to your checkout.js
document.addEventListener("DOMContentLoaded", () => {
    loadCheckoutCart();
});

function loadCheckoutCart() {
    const cartData = localStorage.getItem("cart");
    const container = document.getElementById("priceSummary");
    const mobileTotal = document.getElementById("mobileTotalAmount");

    if (!cartData || cartData === "[]") {
        if (container) container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    const cart = JSON.parse(cartData);
    let subtotal = 0;

    if (container) {
        container.innerHTML = ""; // Clear existing
        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;
            container.innerHTML += `
                <div class="price-row">
                    <span>${item.name} (x${item.qty})</span>
                    <span>Rs. ${itemTotal}</span>
                </div>`;
        });
        
        // Add Delivery Fee
        const delivery = subtotal > 500 ? 0 : 40;
        container.innerHTML += `
            <hr>
            <div class="price-row"><strong>Total</strong><strong>Rs. ${subtotal + delivery}</strong></div>
        `;
    }
    
    // Update mobile total
    if (mobileTotal) mobileTotal.textContent = `Rs. ${subtotal + delivery}`;
}