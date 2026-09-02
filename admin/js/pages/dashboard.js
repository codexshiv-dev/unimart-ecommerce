(() => {
  let contentEl;

  const renderStatCard = (label, value) => `
    <div class="admin-stat-card">
      <div class="admin-stat-card__label">${label}</div>
      <div class="admin-stat-card__value">${value}</div>
    </div>
  `;

  const renderLoading = () => {
    const area = document.getElementById("dashboardStateArea");
    const body = document.getElementById("dashboardBody");
    body.classList.add("hidden");
    area.innerHTML = `
      <div class="admin-state">
        <div class="admin-spinner" role="status" aria-label="Loading"></div>
        <p class="admin-state__desc">Loading dashboard data…</p>
      </div>
    `;
  };

  const renderError = (message, onRetry) => {
    const area = document.getElementById("dashboardStateArea");
    const body = document.getElementById("dashboardBody");
    body.classList.add("hidden");
    area.innerHTML = `
      <div class="admin-state">
        <div class="admin-state__icon" aria-hidden="true">⚠</div>
        <div class="admin-state__title">Couldn't load the dashboard</div>
        <div class="admin-state__desc">${AdminFormat.escapeHtml(message)}</div>
        <button class="admin-btn admin-btn--primary" id="dashboardRetryBtn" type="button">Try again</button>
      </div>
    `;
    document.getElementById("dashboardRetryBtn")?.addEventListener("click", onRetry);
  };

  const renderOrderRow = (order) => `
    <tr>
      <td class="admin-cell-primary admin-cell-truncate" title="${AdminFormat.escapeHtml(order.orderId)}">${AdminFormat.escapeHtml(order.orderId)}</td>
      <td class="admin-cell-truncate" title="${AdminFormat.escapeHtml(order.customerName)}">${AdminFormat.escapeHtml(order.customerName)}</td>
      <td>${AdminFormat.currency(order.totalAmount)}</td>
      <td><span class="admin-badge admin-badge--${AdminFormat.orderStatusBadge(order.status)}">${AdminFormat.escapeHtml(order.status)}</span></td>
      <td class="admin-cell-muted">${AdminFormat.date(order.createdAt)}</td>
    </tr>
  `;

  const renderProductRow = (product) => {
    const outOfStock = (product.stockQuantity ?? 0) === 0;
    return `
      <tr>
        <td class="admin-cell-primary admin-cell-truncate" title="${AdminFormat.escapeHtml(product.name)}">${AdminFormat.escapeHtml(product.name)}</td>
        <td class="admin-cell-muted">${AdminFormat.escapeHtml(product.category?.name || "—")}</td>
        <td>${AdminFormat.currency(product.price)}</td>
        <td>${outOfStock ? `<span class="admin-badge admin-badge--danger">Out of stock</span>` : (product.stockQuantity ?? 0)}</td>
        <td><span class="admin-badge admin-badge--${AdminFormat.productStatusBadge(product.status)}">${AdminFormat.escapeHtml(product.status)}</span></td>
      </tr>
    `;
  };

  const loadDashboard = async () => {
    renderLoading();
    const area = document.getElementById("dashboardStateArea");
    const body = document.getElementById("dashboardBody");

    try {
      // Independent real endpoints. No dedicated stats endpoint exists on
      // the backend, so counts are derived from what these already return -
      // never invented client-side. The products call also doubles as the
      // source for the Inventory Overview sample (backend already sorts by
      // createdAt desc), so we don't fetch the whole catalog just for a
      // dashboard widget.
      const [productsRes, activeProductsRes, categoriesRes, orders] = await Promise.all([
        AdminProductService.getAll({ limit: 5 }),
        AdminProductService.getAll({ limit: 1, onlyActive: "true" }),
        AdminCategoryService.getAll(),
        AdminOrderService.getAll(),
      ]);

      const totalProducts = productsRes?.pagination?.totalItems ?? 0;
      const activeProducts = activeProductsRes?.pagination?.totalItems ?? 0;
      const categories = categoriesRes?.data || [];
      const totalCategories = categoriesRes?.count ?? categories.length;
      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const pendingOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "Pending").length : 0;

      const stats = document.getElementById("dashboardStats");
      stats.innerHTML = [
        renderStatCard("Total Products", totalProducts),
        renderStatCard("Active Products", activeProducts),
        renderStatCard("Categories", totalCategories),
        renderStatCard("Total Orders", totalOrders),
      ].join("");

      const recentBody = document.getElementById("dashboardRecentOrdersBody");
      const recentOrders = (Array.isArray(orders) ? orders : []).slice(0, 5);
      if (recentOrders.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="5"><div class="admin-state" style="padding: var(--admin-sp-6);"><div class="admin-state__desc">No orders yet.</div></div></td></tr>`;
      } else {
        recentBody.innerHTML = recentOrders.map(renderOrderRow).join("");
      }

      const inventoryBody = document.getElementById("dashboardInventoryBody");
      const recentProducts = productsRes?.data || [];
      if (recentProducts.length === 0) {
        inventoryBody.innerHTML = `<tr><td colspan="5"><div class="admin-state" style="padding: var(--admin-sp-6);"><div class="admin-state__desc">No products yet.</div></div></td></tr>`;
      } else {
        inventoryBody.innerHTML = recentProducts.map(renderProductRow).join("");
      }

      const categoriesBody = document.getElementById("dashboardCategoriesBody");
      if (categories.length === 0) {
        categoriesBody.innerHTML = `<div class="admin-state" style="padding: var(--admin-sp-6);"><div class="admin-state__desc">No categories yet.</div></div>`;
      } else {
        categoriesBody.innerHTML = `<div class="admin-category-chip-list">${categories.map((c) => `<a class="admin-category-chip" href="products.html">${AdminFormat.escapeHtml(c.name)}</a>`).join("")}</div>`;
      }

      area.innerHTML = "";
      body.classList.remove("hidden");
    } catch (error) {
      renderError(error?.message || "Something went wrong loading dashboard data.", loadDashboard);
    }
  };

  (async () => {
    const user = await AdminLayout.guardAndRender("dashboard");
    if (!user) return;

    contentEl = document.getElementById("adminContent");
    const template = document.getElementById("dashboardTemplate");
    contentEl.appendChild(template.content.cloneNode(true));

    document.getElementById("dashboardRefreshBtn")?.addEventListener("click", loadDashboard);

    await loadDashboard();
  })();
})();
