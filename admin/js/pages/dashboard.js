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
      <td class="admin-cell-primary">${AdminFormat.escapeHtml(order.orderId)}</td>
      <td>${AdminFormat.escapeHtml(order.customerName)}</td>
      <td>${AdminFormat.currency(order.totalAmount)}</td>
      <td><span class="admin-badge admin-badge--${AdminFormat.orderStatusBadge(order.status)}">${AdminFormat.escapeHtml(order.status)}</span></td>
      <td class="admin-cell-muted">${AdminFormat.date(order.createdAt)}</td>
    </tr>
  `;

  const loadDashboard = async () => {
    renderLoading();
    const area = document.getElementById("dashboardStateArea");
    const body = document.getElementById("dashboardBody");

    try {
      // Three independent real endpoints. No dedicated stats endpoint exists
      // on the backend, so counts are derived from what these already
      // return - never invented client-side.
      const [productsRes, categoriesRes, orders] = await Promise.all([
        AdminProductService.getAll({ limit: 1 }),
        AdminCategoryService.getAll(),
        AdminOrderService.getAll(),
      ]);

      const totalProducts = productsRes?.pagination?.totalItems ?? 0;
      const totalCategories = categoriesRes?.count ?? (categoriesRes?.data?.length || 0);
      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const pendingOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "Pending").length : 0;

      const stats = document.getElementById("dashboardStats");
      stats.innerHTML = [
        renderStatCard("Total Products", totalProducts),
        renderStatCard("Categories", totalCategories),
        renderStatCard("Total Orders", totalOrders),
        renderStatCard("Pending Orders", pendingOrders),
      ].join("");

      const recentBody = document.getElementById("dashboardRecentOrdersBody");
      const recent = (Array.isArray(orders) ? orders : []).slice(0, 5);
      if (recent.length === 0) {
        recentBody.innerHTML = `<tr><td colspan="5"><div class="admin-state" style="padding: var(--admin-sp-6);"><div class="admin-state__desc">No orders yet.</div></div></td></tr>`;
      } else {
        recentBody.innerHTML = recent.map(renderOrderRow).join("");
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
