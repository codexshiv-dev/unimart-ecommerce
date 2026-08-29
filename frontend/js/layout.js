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
      window.location.href = UniMartConfig.getPath(`index.html?search=${encodeURIComponent(trimmed)}`);
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

// ---- Auth-aware account icon + dropdown ----
function renderAccountIcon() {
  const accountLink = document.getElementById("accountLink");
  if (!accountLink) return;

  document.getElementById("accountDropdown")?.remove();

  if (AuthState.isLoggedIn()) {
    const user = AuthState.getUser();
    accountLink.innerHTML = `<i class="fa-solid fa-circle-user"></i>`;
    accountLink.title = user.name;
    accountLink.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleAccountDropdown(user);
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

function toggleAccountDropdown(user) {
  const existing = document.getElementById("accountDropdown");
  if (existing) {
    existing.remove();
    return;
  }

  const dropdown = document.createElement("div");
  dropdown.id = "accountDropdown";
  dropdown.className = "account-dropdown";
  dropdown.innerHTML = `
    <div class="account-dropdown-header">
      <strong>${user.name}</strong>
      <span>${user.email}</span>
    </div>
    <a href="${UniMartConfig.getPath("pages/orders.html")}">My Orders</a>
    <button id="dropdownLogoutBtn">Logout</button>
  `;
  document.getElementById("accountLink")?.appendChild(dropdown);

  dropdown.querySelector("#dropdownLogoutBtn").addEventListener("click", async () => {
    await AuthState.logout();
    window.showToast?.("Logged out");
    dropdown.remove();
  });

  // Close on outside click - registered once, removes itself after firing.
  setTimeout(() => {
    document.addEventListener("click", function closeOnOutsideClick(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener("click", closeOnOutsideClick);
      }
    });
  }, 0);
}

// ---- Login / Sign Up modal (one modal, two modes - not two separate pages) ----
function openLoginModal() {
  if (document.getElementById("authModal")) return;
  let mode = "login"; // or "register"

  const modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "auth-modal-overlay";
  document.body.appendChild(modal);

  const render = () => {
    const isRegister = mode === "register";
    modal.innerHTML = `
      <div class="auth-modal">
        <button class="auth-modal-close" aria-label="Close">✖</button>
        <h3>${isRegister ? "Create Account" : "Log In"}</h3>
        <form id="authForm">
          ${isRegister ? '<input type="text" id="authName" placeholder="Full Name" required />' : ""}
          <input type="email" id="authEmail" placeholder="Email" required />
          <input type="password" id="authPassword" placeholder="Password${isRegister ? " (min 8 characters)" : ""}" required />
          ${isRegister ? '<input type="tel" id="authPhone" placeholder="Phone (optional)" />' : ""}
          <button type="submit" class="btn-checkout" id="authSubmitBtn">${isRegister ? "Create Account" : "Log In"}</button>
          <p class="auth-error" id="authError" style="display:none"></p>
          <p class="auth-error" id="authSuccess" style="display:none; color: #1a7f37;"></p>
        </form>
        <p class="auth-toggle">
          ${isRegister ? "Already have an account?" : "New here?"}
          <a href="#" id="authToggleLink">${isRegister ? "Log In" : "Create one"}</a>
        </p>
      </div>
    `;

    modal.querySelector(".auth-modal-close").addEventListener("click", close);
    modal.querySelector("#authToggleLink").addEventListener("click", (e) => {
      e.preventDefault();
      mode = isRegister ? "login" : "register";
      render();
    });

    modal.querySelector("#authForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById("authError");
      const successEl = document.getElementById("authSuccess");
      const submitBtn = document.getElementById("authSubmitBtn");
      errorEl.style.display = "none";
      successEl.style.display = "none";

      const email = document.getElementById("authEmail").value.trim();
      const password = document.getElementById("authPassword").value;

      if (isRegister) {
        const name = document.getElementById("authName").value.trim();
        const phone = document.getElementById("authPhone").value.trim();

        if (name.length < 2) return showError(errorEl, "Please enter your full name");
        if (password.length < 8) return showError(errorEl, "Password must be at least 8 characters");

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";
        try {
          await AuthState.register(name, email, password, phone || undefined);
          try {
            await CartState.syncGuestCartToServer();
          } catch (syncError) {
            console.warn("[Auth] Guest cart sync failed after registration:", syncError.message);
          }
          successEl.textContent = "Account created! You're now logged in.";
          successEl.style.display = "block";
          setTimeout(close, 900);
        } catch (error) {
          showError(errorEl, error.message || "Could not create account");
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Account";
        }
      } else {
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";
        try {
          await AuthState.login(email, password);
          try {
            await CartState.syncGuestCartToServer();
          } catch (syncError) {
            console.warn("[Auth] Guest cart sync failed after login:", syncError.message);
          }
          window.showToast?.("Logged in");
          close();
        } catch (error) {
          showError(errorEl, error.message || "Login failed");
          submitBtn.disabled = false;
          submitBtn.textContent = "Log In";
        }
      }
    });
  };

  const showError = (el, message) => { el.textContent = message; el.style.display = "block"; };
  const close = () => modal.remove();
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

  render();
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
    console.error("[Categories] Failed to load:", { status: error.status, message: error.message, networkError: error.networkError || false });
    if (error.networkError) {
      console.error("[Categories] Likely cause: backend unreachable.");
    } else if (error.status === 429) {
      console.error("[Categories] Likely cause: rate limit exceeded (429).");
    } else if (error.status >= 500) {
      console.error("[Categories] Likely cause: backend server error (5xx).");
    }
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
        window.applyCategoryFilter?.(btn.dataset.category, btn.textContent.trim());
        document.getElementById("mobileMenu")?.classList.remove("active");
        document.querySelector(".filters")?.classList.remove("active");
        document.getElementById("overlay")?.classList.remove("active");
      });
    });
  };
  wireClicks(".category-card");
  wireClicks(".mobile-category");

  // Lets script.js's active-filter chip reset the nav highlight back to
  // "All" when the customer clears the filter from the chip instead of
  // from the nav itself - keeps the two UI surfaces in sync.
  window.resetCategoryNavHighlight = () => {
    document.querySelectorAll(".category-card, .mobile-category").forEach((b) => {
      b.classList.toggle("active", !b.dataset.category);
    });
  };
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", async () => {
  initMobileMenu();
  initSearch();

  // One subscription covers every way auth state can change - login,
  // register, logout, or a mid-session expiry detected by apiClient.js -
  // so each of those call sites doesn't need to remember to re-render itself.
  AuthState.onChange(() => {
    renderAccountIcon();
    updateCartBadge();
  });

  await AuthState.init();
  renderCategoryNav();
});
