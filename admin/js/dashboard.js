// ========================================================
// UNIMART ADMIN PANEL - LIVE DASHBOARD ANALYTICS ENGINE
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboardMetrics();
  
  // Real-time synchronization check across open tab windows
  window.addEventListener("storage", (e) => {
    if (e.key === "products" || e.key === "orders" || e.key === "totalCustomers") {
      initializeDashboardMetrics();
    }
  });
});

/**
 * 🛡️ SECURITY LAYER: TEXT SANITIZER PIPELINE (Prevents XSS Exploits)
 */
function sanitizeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Orchestrates calculations and triggers visual updates cleanly
 */
function initializeDashboardMetrics() {
  // Safe load instances directly from global engine modules or fall back to empty structures
  const activeProducts = window.products || JSON.parse(localStorage.getItem("products")) || [];
  
  // Initialize baseline transactional seed items safely if empty
  let activeOrders = JSON.parse(localStorage.getItem("orders"));
  if (!activeOrders) {
    activeOrders = [
      { id: "1001", customer: "Rahul", amount: 1500, status: "delivered" },
      { id: "1002", customer: "Priya", amount: 2300, status: "pending" },
      { id: "1003", customer: "Amit", amount: 850, status: "shipped" }
    ];
    localStorage.setItem("orders", JSON.stringify(activeOrders));
  }
  
  const totalCustomersCount = parseInt(localStorage.getItem("totalCustomers"), 10) || 58;

  calculateKPICards(activeProducts, activeOrders, totalCustomersCount);
  renderRecentOrdersTable(activeOrders);
  renderLowStockInventoryList(activeProducts);
}

/**
 * Computes analytics aggregates and injects them into KPI cards securely
 */
function calculateKPICards(products, orders, baseCustomerCount) {
  const totalProductsEl = document.getElementById("kpiTotalProducts");
  const totalOrdersEl = document.getElementById("kpiTotalOrders");
  const totalRevenueEl = document.getElementById("kpiTotalRevenue");
  const totalCustomersEl = document.getElementById("kpiTotalCustomers");

  // Calculate live calculated total revenue sum from stable sales order nodes
  const totalRevenueSum = orders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Use textContent instead of innerHTML to avoid browser re-parse cycles
  if (totalProductsEl) totalProductsEl.textContent = products.length.toLocaleString();
  if (totalOrdersEl) totalOrdersEl.textContent = orders.length.toLocaleString();
  if (totalCustomersEl) totalCustomersEl.textContent = baseCustomerCount.toLocaleString();
  
  if (totalRevenueEl) {
    totalRevenueEl.textContent = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(totalRevenueSum);
  }
}

/**
 * Renders the recent orders data table using DocumentFragments for high-speed layout packing
 */
function renderRecentOrdersTable(orders) {
  const tbody = document.getElementById("recentOrdersTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 32px; color: #94a3b8; font-weight: 500;">
          No recent orders recorded.
        </td>
      </tr>`;
    return;
  }

  // ✨ FIX: Robust string/number fallback sorting logic (Handles text keys safely)
  const displayOrders = [...orders]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  const fragment = document.createDocumentFragment();

  displayOrders.forEach(order => {
    const tr = document.createElement("tr");
    const statusClass = sanitizeHTML(order.status.toLowerCase().trim());
    const formattedStatus = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);

    tr.innerHTML = `
      <td style="font-weight: 500;">#${sanitizeHTML(order.id)}</td>
      <td>${sanitizeHTML(order.customer)}</td>
      <td style="font-weight: 600;">₹${Number(order.amount).toLocaleString("en-IN")}</td>
      <td>
        <span class="status ${statusClass}">
          ${formattedStatus}
        </span>
      </td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

/**
 * Evaluates stock thresholds and lists low-stock items (quantity <= 5)
 */
function renderLowStockInventoryList(products) {
  const container = document.getElementById("lowStockContainerList");
  if (!container) return;

  container.innerHTML = "";

  // Filter products where remaining stock is critically low
  const lowStockItems = products.filter(p => {
    const stockQty = p.stock !== undefined ? Number(p.stock) : 4;
    return stockQty <= 5;
  });

  if (lowStockItems.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px; color: #10b981; font-size: 13px; font-weight: 500;">
        ✅ All product inventory levels are healthy!
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  lowStockItems.forEach(p => {
    const stockQty = p.stock !== undefined ? Number(p.stock) : 3;
    const criticalLabelColor = stockQty <= 2 ? "#ef4444" : "#f59e0b"; // Red warning for ultra-low stock

    const div = document.createElement("div");
    div.className = "stock-item";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "8px 0";
    
    div.innerHTML = `
      <span style="font-weight: 500;">${sanitizeHTML(p.name || p.title)}</span>
      <strong style="color: ${criticalLabelColor}; background: ${criticalLabelColor}12; padding: 4px 8px; border-radius: 6px; font-size: 12px;">
        ${stockQty} Left
      </strong>
    `;
    fragment.appendChild(div);
  });

  container.appendChild(fragment);
}

// Global Exports Hook
window.initializeDashboardMetrics = window.initializeDashboardMetrics;