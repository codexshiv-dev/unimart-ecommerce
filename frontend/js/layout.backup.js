/**
 * UNiMART — Layout behavior. Header/footer markup is now inlined directly
 * in each page (removing the old runtime fetch()+innerHTML injection, which
 * caused an extra network request and a visible flash of empty header on
 * every page load). This file only wires up the interactive parts.
 */

// ---- Mobile menu + filters drawer open/close (shared overlay) ----
function initMobileMenu() {
  const openBtn = document.getElementById("openMenu");
  const closeBtn = document.getElementById("closeMenu");
  const menu = document.getElementById("mobileMenu");
  const filterOpenBtn = document.getElementById("openFilters");
  const filters = document.querySelector(".filters");
  const overlay = document.getElementById("overlay");
  if (!overlay) return;

  const closeAll = () => {
    menu?.classList.remove("active");
    filters?.classList.remove("active");
    overlay.classList.remove("active");
  };

  openBtn?.addEventListener("click", () => { menu?.classList.add("active"); overlay.classList.add("active"); });
  filterOpenBtn?.addEventListener("click", () => { filters?.classList.add("active"); overlay.classList.add("active"); });
  closeBtn?.addEventListener("click", closeAll);
  overlay.addEventListener("click", closeAll);
}

// ---- Search (debounced, redirects to the listing page with a query) ----
function initSearch() {
  const handleSearch = debounce((value) => {
    const trimmed = value.trim();
    const onIndex = document.getElementById("productGrid");
    if (onIndex && window.applySearch) {
      window.applySearch(trimmed); // index.html handles it in-page
    } else if (trimmed) {
      window.location.href = `/index.html?search=${encodeURIComponent(trimmed)}`;
    }
  }, 350);

  ["searchInputDesktop", "searchInputMobile"].forEach((id) => {
    const input = document.getElementById(id);
    input?.addEventListener("input", (e) => handleSearch(e.target.value));
  });
}

// ---- Cart badge ----
async function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  try {
    const count = await CartState.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  } catch (error) {
    // Cart badge failing shouldn't break the page - fail quietly.
  }
}
window.updateCartBadge = updateCartBadge;

// ---- Auth-aware account icon ----
function renderAccountIcon() {
  const accountLink = document.getElementById("accountLink");
  if (!accountLink) return;

  if (AuthState.isLoggedIn()) {
    const user = AuthState.getUser();
    accountLink.innerHTML = `<i class="fa-solid fa-circle-user"></i>`;
    accountLink.title = `${user.name} (click to log out)`;
    accountLink.onclick = async (e) => {
      e.preventDefault();
      await AuthState.logout();
      window.showToast?.("Logged out");
      renderAccountIcon();
      updateCartBadge();
    };
  } else {
    accountLink.innerHTML = `<i class="fa-regular fa-user"></i>`;
    accountLink.title = "Login";
    accountLink.onclick = (e) => {
      e.preventDefault();
      openLoginModal();
    };
  }
}

// ---- Minimal login modal (kept intentionally simple - full account pages are a future module) ----
function openLoginModal() {
  if (document.getElementById("authModal")) return;

  const modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "auth-modal-overlay";
  modal.innerHTML = `
    <div class="auth-modal">
      <button class="auth-modal-close" aria-label="Close">✖</button>
      <h3>Log In</h3>
      <form id="authForm">
        <input type="email" id="authEmail" placeholder="Email" required />
        <input type="password" id="authPassword" placeholder="Password" required />
        <button type="submit" class="btn-checkout">Log In</button>
        <p class="auth-error" id="authError" style="display:none"></p>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.querySelector(".auth-modal-close").addEventListener("click", close);

  modal.querySelector("#authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;
    const errorEl = document.getElementById("authError");
    errorEl.style.display = "none";

    try {
      await AuthState.login(email, password);
      await CartState.syncGuestCartToServer();
      window.showToast?.("Logged in");
      close();
      renderAccountIcon();
      updateCartBadge();
    } catch (error) {
      errorEl.textContent = error.message || "Login failed";
      errorEl.style.display = "block";
    }
  });
}

// ---- Categories (shared render for the desktop filter sidebar + mobile dropdown) ----
async function renderCategoryNav() {
  const desktopContainer = document.querySelector(".categories");
  const mobileContainer = document.querySelector(".dropdown-menu");
  if (!desktopContainer && !mobileContainer) return;

  let categories = [];
  try {
    categories = await CategoryService.getCategories();
  } catch (error) {
    return; // Category nav failing shouldn't break the page
  }

  const buildButtons = (className) => {
    const all = `<button class="${className} active" data-category="">All</button>`;
    const rest = categories
      .map((c) => `<button class="${className}" data-category="${c.slug}">${c.name}</button>`)
      .join("");
    return all + rest;
  };

  if (desktopContainer) desktopContainer.innerHTML = buildButtons("category-card");
  if (mobileContainer) mobileContainer.innerHTML = buildButtons("mobile-category");

  const wireClicks = (selector) => {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(selector).forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        window.applyCategoryFilter?.(btn.dataset.category);
        document.getElementById("mobileMenu")?.classList.remove("active");
        document.querySelector(".filters")?.classList.remove("active");
        document.getElementById("overlay")?.classList.remove("active");
      });
    });
  };
  wireClicks(".category-card");
  wireClicks(".mobile-category");
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", async () => {
  initMobileMenu();
  initSearch();
  await AuthState.init();
  renderAccountIcon();
  updateCartBadge();
  renderCategoryNav();
});
