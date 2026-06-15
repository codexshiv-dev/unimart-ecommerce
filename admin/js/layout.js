// ========================================================
// GLOBAL REUSABLE INTERFACE TOOGLE DELEGATOR
// ========================================================
document.addEventListener("click", (e) => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  
  // --- 👤 SAFE PROFILE DROPDOWN LOGIC (No Mutation Triggers) ---
  const hub = document.getElementById("profileDropdownHub");
  const trigger = hub?.querySelector(".profile-box");

  if (hub && trigger) {
    if (e.target.closest(".profile-box")) {
      e.stopPropagation();
      const isOpen = hub.classList.contains("dropdown-active");
      if (isOpen) {
        hub.classList.remove("dropdown-active");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        hub.classList.add("dropdown-active");
        trigger.setAttribute("aria-expanded", "true");
      }
    } else if (!hub.contains(e.target)) { // 🛡️ Now safely wrapped within the parent "if (hub)" guard block
      hub.classList.remove("dropdown-active");
      trigger.setAttribute("aria-expanded", "false");
    }
  }

  // --- 🚪 LOGOUT TOAST NOTIFICATION PROXY ---
  if (e.target.id === "navbarLogoutBtn" || e.target.closest("#navbarLogoutBtn")) {
    if (typeof window.showToast === "function") {
      window.showToast("Logging out of Administrator panel securely...", "warning");
    }
  }

  if (!sidebar) return;

  // 1. Open / Close Menu Sidebars
  if (e.target.id === "toggleSidebar" || e.target.closest("#toggleSidebar")) {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("mobile-open");
      overlay?.classList.toggle("show");
      document.body.classList.toggle("no-scroll");
    } else {
      sidebar.classList.toggle("collapsed");
    }
  }

  // 2. Dismiss mobile drawer menu layout when clicking the overlay layer
  if (e.target.id === "sidebarOverlay") {
    sidebar.classList.remove("mobile-open");
    overlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
  }
});

// ✨ PERFORMANCE OPTIMIZATION: Debounced resize listener
let resizeDebounceTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeDebounceTimeout);
  resizeDebounceTimeout = setTimeout(() => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (window.innerWidth > 768) {
      sidebar?.classList.remove("mobile-open");
      overlay?.classList.remove("show");
      document.body.classList.remove("no-scroll");
    }
  }, 60); 
});

// ========================================================
// AUTOMATED HIGH-FIDELITY NAVIGATION SYNC ENGINE
// ========================================================
function highlightActiveSidebarMenu() {
  const pathParts = window.location.pathname.split("/");
  let currentFileName = pathParts.pop().toLowerCase();

  if (!currentFileName && pathParts.length > 0) {
    currentFileName = "dashboard.html"; 
  }

  const menuLinks = document.querySelectorAll(".sidebar-menu a");
  if (menuLinks.length === 0) return;

  menuLinks.forEach(link => {
    link.classList.remove("active");

    const linkHref = link.getAttribute("href");
    if (!linkHref) return;

    const targetFileName = linkHref.split("/").pop().toLowerCase();

    if (currentFileName === targetFileName) {
      link.classList.add("active");
    }
  });

  if (currentFileName === "" || currentFileName === "index.html" || currentFileName === "dashboard.html") {
    const dashboardLink = document.querySelector('.sidebar-menu a[href*="dashboard.html"]');
    dashboardLink?.classList.add("active");
  }
}

window.highlightActiveSidebarMenu = highlightActiveSidebarMenu;

// ========================================================
// ASYNCHRONOUS COMPONENT MOUNT OBSERVER LAYER
// ========================================================
const layoutObserver = new MutationObserver((mutations, observer) => {
  const sidebarMenu = document.querySelector(".sidebar-menu");
  if (sidebarMenu) {
    window.highlightActiveSidebarMenu();
    observer.disconnect(); 
  }
});

layoutObserver.observe(document.body, {
  childList: true,
  subtree: true
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.highlightActiveSidebarMenu);
} else {
  window.highlightActiveSidebarMenu();
}
window.addEventListener("load", window.highlightActiveSidebarMenu);