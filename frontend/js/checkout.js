// ==========================================================================
// 🔗 CLOUD API ROUTE ROUTING REGISTRY
// ==========================================================================
const RENDER_BACKEND_URL = "https://your-backend-name.onrender.com"; // ⚠️ Replace with your actual Render URL

function handleCheckout() {
    const nameInput = document.getElementById("userName");
    const addressInput = document.getElementById("userAddress");
    const shippingForm = document.getElementById("shippingForm");
    const overlay = document.getElementById("orderOverlay");
  
    const name = nameInput ? nameInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";

    if (!name || !address) {
        alert("Please enter your name and address for delivery! 🚚");
        if (shippingForm) {
            shippingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (!name) nameInput.focus();
            else addressInput.focus();
        }
        return;
    }

    const cart = getCartData(); 
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Show processing screen overlay loader
    if (overlay) overlay.style.display = "flex";

    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let delivery = subtotal > 500 ? 0 : 40;
    let total = subtotal + delivery;

    // 📦 COMPILING DATABASE INVOICE DATA OBJECT
    const orderPayload = {
        customerName: name,
        customerAddress: address,
        paymentMethod: "WhatsApp (Manual)",
        itemsSubtotal: subtotal,
        deliveryFee: delivery,
        grandTotal: total,
        cartItems: cart.map(item => ({
            productId: item._id || 'N/A',
            name: item.name,
            quantity: item.qty,
            unitPrice: item.price
        }))
    };

    // 🚀 TRANSMIT LIVE DATA STREAM TO RENDER BACKEND
    fetch(`${RENDER_BACKEND_URL}/api/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Cloud operational synchronization failed");
        }
        return response.json();
    })
    .then(savedOrder => {
        // Build your existing WhatsApp text message using the dynamic ID returned from your server
        let message = `*✨ NEW ORDER RECEIVED ✨*\n`;
        message += `📋 *Order ID:* #${savedOrder._id || 'Pending'}\n`;
        message += `--------------------------\n`;
        message += `👤 *Customer:* ${name}\n`;
        message += `📍 *Address:* ${address}\n`;
        message += `--------------------------\n\n`;
        message += `*📦 ITEMS ORDERED:* \n\n`;

        cart.forEach((item, index) => {
            message += `*${index + 1}. ${item.name}* (Qty: ${item.qty})\n`;
        });

        message += `\n*TOTAL AMOUNT: ${formatINR(total)}*\n`;
        message += `_Please confirm my order structure!_`;

        const phone = "919170570583"; 
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        // Clear storefront state and redirect
        localStorage.removeItem("cart");
        if (window.updateCartCount) window.updateCartCount();
        
        if (overlay) overlay.style.display = "none";
        window.location.href = url;
    })
    .catch(error => {
        console.error("Backend transmission issue:", error);
        if (overlay) overlay.style.display = "none";
        alert("System connection timeout. Your order could not be saved to the panel, but you can still complete it over WhatsApp directly!");
    });
}