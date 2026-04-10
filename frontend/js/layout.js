// ===============================
// LOAD HEADER
// ===============================
async function loadHeader() {
  try {
    const res = await fetch("../components/header.html");
    const data = await res.text();
    document.getElementById("header").innerHTML = data;

    // 1. Setup Hamburger/Menu
    initHeaderEvents();

    // 2. Setup Search Logic (Re-bind the event listeners)
    if (typeof resetPageAndRender === "function") {
        document.getElementById("searchInputDesktop")?.addEventListener("input", resetPageAndRender);
        document.getElementById("searchInputMobile")?.addEventListener("input", resetPageAndRender);
    }

    if (typeof updateCartCount === "function") updateCartCount();

  } catch (err) {
    console.error("Header load failed:", err);
  }
}

// ===============================
// LOAD FOOTER
// ===============================
async function loadFooter() {
  try {
    const res = await fetch("../components/footer.html");
    const data = await res.text();

    document.getElementById("footer").innerHTML = data;

  } catch (err) {
    console.error("Footer load failed:", err);
  }
}

// ===============================
// HEADER EVENTS (ALL HERE)
// ===============================
function initHeaderEvents() {
  const openMenuBtn = document.getElementById("openMenu");
  const closeMenuBtn = document.getElementById("closeMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  if (!openMenuBtn || !mobileMenu || !overlay) return;

  const openMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    mobileMenu.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
  };

  openMenuBtn.onclick = openMenu; // Direct assignment is safer for injected HTML
  closeMenuBtn.onclick = closeMenu;
  overlay.onclick = closeMenu;

  // FIX: Only close menu if a LINK (<a>) is clicked, not the whole container
  mobileMenu.onclick = (e) => {
    if (e.target.tagName === 'A') {
      closeMenu();
    }
  };
}
// ===============================
// INIT APP
// ===============================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    loadFooter();
  });
} else {
  loadHeader();
  loadFooter();
}