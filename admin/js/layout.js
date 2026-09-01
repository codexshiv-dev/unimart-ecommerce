/**
 * UNiMART Admin — Shell layout. Renders the sidebar + topbar into
 * #adminShellRoot on every authenticated admin page, wires up mobile nav
 * toggle, active-route highlighting, user info, and logout.
 *
 * Usage: each protected page includes config.js, apiClient.js, authService.js,
 * authState.js, toast.js, then this file, then calls:
 *   AdminLayout.guardAndRender('dashboard')  // 'dashboard' | 'categories' | 'products' | 'orders'
 * which resolves to the current user (redirecting to login if not an admin)
 * and only then renders the shell + reveals the page content.
 */
const AdminLayout = (() => {
  const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", href: "dashboard.html", icon: "\u25A6" },
    { key: "categories", label: "Categories", href: "categories.html", icon: "\u2637" },
    { key: "products", label: "Products", href: "products.html", icon: "\u25A3" },
    { key: "orders", label: "Orders", href: "orders.html", icon: "\u2637" },
  ];

  const initials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "A";
  };

  const renderShell = (activeKey, user) => {
    const root = document.getElementById("adminShellRoot");
    if (!root) return;

    const navHtml = NAV_ITEMS.map((item) => `
      <a class="admin-nav-link" href="${item.href}" ${item.key === activeKey ? 'aria-current="page"' : ""}>
        <span class="admin-nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join("");

    root.innerHTML = `
      <div class="admin-sidebar-backdrop" id="adminSidebarBackdrop"></div>
      <aside class="admin-sidebar" id="adminSidebar" aria-label="Admin navigation">
        <div class="admin-sidebar__brand">
          <span class="admin-sidebar__brand-mark" aria-hidden="true">U</span>
          <span>UNiMART Admin</span>
        </div>
        <nav class="admin-sidebar__nav">${navHtml}</nav>
        <div class="admin-sidebar__footer">
          <a class="admin-nav-link" href="${AdminConfig.getPath("index.html")}" data-storefront-link>
            <span class="admin-nav-icon" aria-hidden="true">\u2192</span>
            <span>View Storefront</span>
          </a>
        </div>
      </aside>
      <div class="admin-main">
        <header class="admin-topbar">
          <div class="admin-topbar__left">
            <button class="admin-mobile-toggle" id="adminMobileToggle" aria-label="Toggle navigation menu" aria-expanded="false">
              <span aria-hidden="true">\u2630</span>
            </button>
            <span class="admin-topbar__title" id="adminTopbarTitle"></span>
          </div>
          <div class="admin-topbar__right">
            <div class="admin-user-menu">
              <div class="admin-user-avatar" aria-hidden="true">${initials(user.name)}</div>
              <div class="admin-user-info">
                <span class="admin-user-name">${user.name || "Admin"}</span>
                <span class="admin-user-role">${user.role || "admin"}</span>
              </div>
            </div>
            <button class="admin-logout-btn" id="adminLogoutBtn" type="button">Log out</button>
          </div>
        </header>
        <main class="admin-content" id="adminContent"></main>
      </div>
      <div id="toastContainer" aria-live="polite"></div>
    `;

    const activeItem = NAV_ITEMS.find((i) => i.key === activeKey);
    const titleEl = document.getElementById("adminTopbarTitle");
    if (titleEl) titleEl.textContent = activeItem ? activeItem.label : "Admin";

    // Mobile nav toggle
    const shell = document.getElementById("adminShell");
    const toggleBtn = document.getElementById("adminMobileToggle");
    const backdrop = document.getElementById("adminSidebarBackdrop");
    const closeSidebar = () => {
      shell?.classList.remove("admin-sidebar-open");
      toggleBtn?.setAttribute("aria-expanded", "false");
    };
    toggleBtn?.addEventListener("click", () => {
      const isOpen = shell?.classList.toggle("admin-sidebar-open");
      toggleBtn.setAttribute("aria-expanded", String(Boolean(isOpen)));
    });
    backdrop?.addEventListener("click", closeSidebar);
    document.querySelectorAll(".admin-nav-link").forEach((link) => link.addEventListener("click", closeSidebar));

    // Logout
    document.getElementById("adminLogoutBtn")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.textContent = "Logging out…";
      try {
        await AdminAuthState.logout();
      } catch (err) {
        // Even if the network call fails, we still want to send the admin
        // back to login rather than leave them stuck on a broken button.
        console.error("[AdminLayout] Logout request failed:", err);
      }
      window.location.href = AdminConfig.getPath("pages/login.html");
    });
  };

  // Resolves the current admin, redirecting to login when not authenticated
  // or not an admin. Returns the user object on success so the calling page
  // can proceed to render its own content. This is a UX guard only - the
  // real security boundary is the backend's protect + authorize("admin").
  const guardAndRender = async (activeKey) => {
    const user = await AdminAuthState.init();

    if (!user || user.role !== "admin") {
      window.location.href = AdminConfig.getPath("pages/login.html");
      return null;
    }

    renderShell(activeKey, user);
    return user;
  };

  return { guardAndRender, NAV_ITEMS };
})();

window.AdminLayout = AdminLayout;
