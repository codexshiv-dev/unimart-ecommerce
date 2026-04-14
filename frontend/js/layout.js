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

    // 2. Setup Global Search Logic
    const dInput = document.getElementById("searchInputDesktop");
    const mInput = document.getElementById("searchInputMobile");

    const handleGlobalSearch = (e) => {
      const query = e.target.value.trim();
      const isSearchInput = e.type === "input";
      const isEnterKey = e.key === "Enter";

      // A. If user presses Enter, REDIRECT to index if not already there
      if (isEnterKey) {
        e.preventDefault();
        if (query) {
          // Check if we are already on index/home
          const isHome = window.location.pathname.includes("index.html") || window.location.pathname === "/";
          
          if (!isHome) {
            window.location.href = `/index.html?search=${encodeURIComponent(query)}`;
            return;
          }
        }
      }

      // B. If user is typing AND we are on the index page, trigger instant filter
      if (isSearchInput && typeof window.resetPageAndRender === "function") {
        window.resetPageAndRender();
      }
    };

    // Attach listeners to both inputs (Desktop & Mobile)
    [dInput, mInput].forEach(input => {
      if (input) {
        input.addEventListener("input", handleGlobalSearch);
        input.addEventListener("keydown", handleGlobalSearch);
      }
    });

    // 3. Update Cart UI if function exists
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

  
 // Handle the Dropdown Toggle separately with stopPropagation
  const dropdownToggle = mobileMenu.querySelector(".dropdown-toggle");
  const dropdownMenu = mobileMenu.querySelector(".dropdown-menu");

  dropdownToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the click from reaching mobileMenu.onclick
    dropdownMenu?.classList.toggle("show");
  });

 // Close menu when a link is clicked
  mobileMenu.onclick = (e) => {
    // Check if the click was on a link or a specific category button
    const isLink = e.target.tagName === 'A';
    const isCategoryBtn = e.target.classList.contains('mobile-category');
    if (isLink || isCategoryBtn) {
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