/**
 * ==========================================================================
 * 📦 UNIMART PRODUCTION MANAGEMENT SYSTEM CENTRAL ENGINE (ORDERS PRO)
 * ==========================================================================
 */
// 🌐 GLOBAL STATE
let GLOBAL_ORDERS_CACHE = [];

document.addEventListener("DOMContentLoaded", () => {
    loadDynamicOrdersTable();
    setupOrderEventListeners();
});

/**
 * Initializes interactive user UI components
 */
function setupOrderEventListeners() {
    const searchInput = document.getElementById("orderSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", handleOrderFiltering);
    }

    const exportBtn = document.getElementById("exportOrdersCsvBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportOrdersToCSV);
    }
}

/**
 * Fetches dynamic data stream from the server using Central Config
 */
async function loadDynamicOrdersTable() {
  const tbody = document.getElementById("ordersDataTable")?.querySelector("tbody");
  if (!tbody) return;

  try {
    const response = await fetch(window.UniMartConfig.getEndpoint('orders'));
    if (!response.ok) throw new Error("Could not pull network transaction stream");
    
    GLOBAL_ORDERS_CACHE = await response.json();
    renderOrderRows(GLOBAL_ORDERS_CACHE);
  } catch (error) {
    console.error("Failed to connect to backend:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:#ef4444; padding:30px; font-weight:500;">
          ⚠️ Connection Error. Ensure Backend is active and Config is correct.
        </td>
      </tr>`;
  }
}

/**
 * Maps arrays directly into functional table rows
 */
function renderOrderRows(ordersList) {
    const tbody = document.getElementById("ordersDataTable")?.querySelector("tbody");
    if (!tbody) return;

    updateAdminMetrics(ordersList);

    if (ordersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#64748b;">No matching orders found.</td></tr>`;
        return;
    }

    // ✨ PERFORMANCE OPTIMIZATION: Implemented DocumentFragment for seamless DOM rendering
    const fragment = document.createDocumentFragment();
    tbody.innerHTML = "";

    

    ordersList.forEach(order => {
        const tr = document.createElement("tr");
        
        // Hardened MongoDB safe property defaults
        const orderId = order.orderId || (order._id ? order._id.slice(-8).toUpperCase() : 'N/A');
        const name = order.customerName || "Walk-in Buyer";
        const phone = order.customerPhone || "No Phone";
        const locationAddress = order.customerAddress || order.shippingAddress || "No Address Provided";

        // WhatsApp Helper: Clean phone, remove leading 0, prepend 977
        const cleanPhone = (order.customerPhone || "").replace(/\D/g, '').replace(/^0+/, '');
        const whatsappLink = `https://wa.me/977${cleanPhone}`;
        
        // Natively tuned Nepalese locale parsing fixes formatting edge cases cleanly
        const dateStamp = order.createdAt 
            ? new Date(order.createdAt).toLocaleString('en-NP', { dateStyle: 'medium', timeStyle: 'short' }) 
            : 'N/A';
            
        const totalCost = Number(order.totalAmount || 0);
        const currentStatus = order.status || "⏳ Pending";

        let statusBadgeClass = "fulfillment-pending";
        if (currentStatus.includes("Transit") || currentStatus.includes("Ship") || currentStatus.includes("Processing")) statusBadgeClass = "fulfillment-transit";
        if (currentStatus.includes("Cancelled") || currentStatus.includes("Stop") || currentStatus.includes("Failed")) statusBadgeClass = "fulfillment-cancelled";
        if (currentStatus.includes("Complete") || currentStatus.includes("Delivered")) statusBadgeClass = "fulfillment-completed";

        // Payment status fallback verification
        const rawPaymentStatus = order.paymentStatus || "Authorized";

        tr.innerHTML = `
            <td data-label="Order ID"><strong class="order-id-tag">#${sanitizeHTML(orderId)}</strong></td>
            <td data-label="Customer">
                <div class="customer-profile-cell">
                    <span class="cust-name">${sanitizeHTML(name)}</span>
                    <span class="cust-email" title="${sanitizeHTML(locationAddress)}">${sanitizeHTML(truncateString(locationAddress, 28))}</span>
                </div>
            </td>
            <td data-label="Timestamp"><span class="date-stamp">${sanitizeHTML(dateStamp)}</span></td>
            <td data-label="Total"><span class="price-val-tag">${formatCurrency(totalCost)}</span></td>
            <td data-label="Payment"><span class="badge payment-${rawPaymentStatus.toLowerCase()}">● ${sanitizeHTML(rawPaymentStatus)}</span></td>
            <td data-label="Fulfillment"><span class="badge ${statusBadgeClass}">${sanitizeHTML(currentStatus)}</span></td>
           <td data-label="Actions">
                <div class="row-action-triggers">
                    <button class="row-btn view-details">👁️ View</button>
                    <!-- Add this new button -->
                    <a href="${whatsappLink}" target="_blank" class="row-btn" style="background:#25d366; color:white; padding:4px 8px; border-radius:4px; text-decoration:none;">💬 Chat</a>
                    <button class="row-btn update-status">⚙️ Status</button>
                </div>
            </td>
        `;

        // Direct programmatic node hooks prevent inline scoping leakage
        tr.querySelector(".view-details").onclick = () => window.openOrderModal(order._id);
        tr.querySelector(".update-status").onclick = () => cycleOrderStatusStep(order._id, currentStatus);

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

/**
 * Cycle Logistics Actions via REST API PATCH operations
 */
async function cycleOrderStatusStep(orderId, statusValue) {
    
    let targetNextStatus = "Processing";
    
    if (statusValue === "Pending") targetNextStatus = "Processing";
    else if (statusValue === "Processing") targetNextStatus = "Shipped";
    else if (statusValue === "Shipped") targetNextStatus = "Delivered";
    else if (statusValue === "Delivered") targetNextStatus = "Cancelled";
    else targetNextStatus = "⏳ Pending";

    try {
        const url = `${window.UniMartConfig.getEndpoint('orders')}/${orderId}`;
        const response = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: targetNextStatus })
        });
        
        if (!response.ok) throw new Error("Could not modify order status");
        
        if (typeof window.showToast === "function") {
            window.showToast("Order status updated successfully!", "success");
        }
        loadDynamicOrdersTable(); 
    } catch (err) {
        console.error("Status state evolution error:", err);
        if (typeof window.showToast === "function") {
            window.showToast("Failed to modify order status.", "error");
        }
    }
}

/**
 * Computes live metric dashboard totals dynamically
 */
function updateAdminMetrics(orders) {
    const pendingCount = orders.filter(o => !o.status || o.status.includes("Pending")).length;
    const transitCount = orders.filter(o => o.status && (o.status.includes("Transit") || o.status.includes("Processing"))).length;
    const totalEarnings = orders
        .filter(o => o.status && !o.status.includes("Cancelled") && !o.status.includes("Failed"))
        .reduce((sum, o) => sum + Number(o.grandTotal || o.totalAmount || 0), 0);

    const pendingTarget = document.getElementById("metricPendingCount");
    const transitTarget = document.getElementById("metricTransitCount");
    const grossTarget = document.getElementById("metricGrossRevenue");

    if (pendingTarget) pendingTarget.textContent = `${pendingCount} Orders`;
    if (transitTarget) transitTarget.textContent = `${transitCount} Packages`;
    if (grossTarget) grossTarget.textContent = formatCurrency(totalEarnings);
}

/**
 * Interactive Client-Side Search Filter
 */
function handleOrderFiltering(e) {
    const keyword = e.target.value.toLowerCase().trim();
    if (!keyword) {
        renderOrderRows(GLOBAL_ORDERS_CACHE);
        return;
    }

    const matches = GLOBAL_ORDERS_CACHE.filter(order => {
        const orderId = order.orderId || (order._id ? order._id.slice(-8).toUpperCase() : '');
        const name = (order.customerName || '').toLowerCase();
        const address = (order.customerAddress || order.shippingAddress || '').toLowerCase();
        return orderId.toUpperCase().includes(keyword.toUpperCase()) || name.includes(keyword) || address.includes(keyword);
    });

    renderOrderRows(matches);
}

/**
 * CSV Export functionality
 */
function exportOrdersToCSV() {
    if (GLOBAL_ORDERS_CACHE.length === 0) {
        if (typeof window.showToast === "function") window.showToast("No active rows to export.", "warning");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Order ID,Customer Name,Shipping Address,Grand Total,Status\n";
    
    GLOBAL_ORDERS_CACHE.forEach(o => {
        const rowId = o.orderId || (o._id ? o._id.slice(-8).toUpperCase() : 'N/A');
        const escapeName = `"${(o.customerName || '').replace(/"/g, '""')}"`;
        const phone = o.customerPhone || "N/A"; // ADDED THIS
        const addressText = o.customerAddress || o.shippingAddress || '';
        const escapeAddress = `"${addressText.replace(/"/g, '""')}"`;
        const total = o.grandTotal || o.totalAmount || 0;
        csvContent += `${rowId},${escapeName},${phone},${escapeAddress},${total},${o.status || 'Pending'}\n`;
    });

    const uri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", uri);
    
    // Explicitly targets formatting output configurations matching local times cleanly
    const localDateString = new Date().toLocaleString('en-NP', {dateStyle: 'short'}).replace(/\//g, '-');
    link.setAttribute("download", `UniMart_Orders_Dataset_${localDateString}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof window.showToast === "function") window.showToast("CSV export initiated.", "success");
}

/**
 * Opens dynamic modal preview
 */
window.openOrderModal = function(orderId) {
    const order = GLOBAL_ORDERS_CACHE.find(o => o._id === orderId);
    if (!order) return;

    const titleEl = document.getElementById("modalOrderTitle");
    const contentEl = document.getElementById("modalItemsContent");
    const modal = document.getElementById("orderItemsModal");

    if (titleEl) titleEl.textContent = `Order Verification Info`;
    
    if (contentEl) {
        contentEl.innerHTML = "";
        const finalAddress = order.customerAddress || order.shippingAddress || "No Address Provided";
        let itemsHtml = `
            <div style="font-size:13px; color:#475569; border-bottom:1px solid #f1f5f9; padding-bottom:8px; margin-bottom:8px;">
                <strong>📞 Phone:</strong> ${sanitizeHTML(order.customerPhone || 'N/A')}<br>
                <strong>📍 Address:</strong> ${sanitizeHTML(finalAddress)}
            </div>
            
        `;

        const targetItemsArray = order.cartItems || order.items || [];

        if (targetItemsArray.length > 0) {
            targetItemsArray.forEach(item => {
                const itemQty = item.quantity || item.qty || 1;
                const itemPrice = item.unitPrice || item.price || 0;
                itemsHtml += `
                    <div style="display:flex; justify-content:space-between; font-size:13px; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; margin-bottom:6px;">
                        <span>${sanitizeHTML(item.name || 'Products Line')} <strong style="color:var(--primary, #2563eb);">x${itemQty}</strong></span>
                        <span style="font-weight:600; color:#0f172a;">${formatCurrency(itemPrice * itemQty)}</span>
                    </div>`;
            });
        } else {
            itemsHtml += `<p style="font-size:13px; color:#94a3b8; margin:0;">No detailed lines attached.</p>`;
        }
        contentEl.innerHTML = itemsHtml;
    }
    if (modal) modal.style.display = "flex";
};

window.closeOrderModal = function() {
    const modal = document.getElementById("orderItemsModal");
    if (modal) modal.style.display = "none";
};

// ==========================================================================
// UTILITY HELPERS
// ==========================================================================
function sanitizeHTML(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * Standardized Unified Store Currency Presenter (Nepalese Locale Setup)
 */
function formatCurrency(amount) {
    return amount.toLocaleString('en-NP', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'NPR',
    }).replace("NPR", "Rs. "); 
}

function truncateString(str, num) {
    if (!str) return "";
    return str.length <= num ? str : str.slice(0, num) + "...";
}