document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // GLOBAL STATE
  // =======================
  let activeCategory = "all";
 

  // =======================
  // HAMBURGER MENU
  // =======================
  const openMenuBtn = document.getElementById("openMenu");
  const closeMenuBtn = document.getElementById("closeMenu");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("overlay");

  function closeMenu() {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  if (openMenuBtn) {
    openMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if (overlay) overlay.addEventListener("click", closeMenu);


  // =======================
  // SEARCH & FILTER
  // =======================
  const searchDesktop = document.getElementById("searchInputDesktop");
  const searchMobile = document.getElementById("searchInputMobile");

  const categoryButtons = document.querySelectorAll(".category-card");
  const mobileCategories = document.querySelectorAll(".mobile-category");
  const products = document.querySelectorAll(".product-card");
  const noResult = document.getElementById("noResult");

  function filterProducts() {
    const textDesktop = searchDesktop ? searchDesktop.value : "";
    const textMobile = searchMobile ? searchMobile.value : "";
    const searchText = (textDesktop || textMobile).toLowerCase().trim();

    let found = false;

    products.forEach(card => {
      const title = card.querySelector(".product-title")?.textContent.toLowerCase() || "";
      const desc = card.dataset.desc?.toLowerCase() || "";
      const category = card.dataset.category;

      const matchSearch = title.includes(searchText) || desc.includes(searchText);
      const matchCategory = activeCategory === "all" || category === activeCategory;

      if (matchSearch && matchCategory) {
        card.style.display = "block";
        found = true;
      } else {
        card.style.display = "none";
      }
    });

    if (noResult) {
      noResult.style.display = found ? "none" : "block";
    }
  }


  // =======================
  // DESKTOP CATEGORIES
  // =======================
  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
     

      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      mobileCategories.forEach(b => {
        b.classList.toggle("active", b.dataset.category === activeCategory);
      });

      filterProducts();
    });
  });


  // =======================
  // MOBILE CATEGORIES
  // =======================
  mobileCategories.forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
    

      mobileCategories.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      categoryButtons.forEach(b => {
        b.classList.toggle("active", b.dataset.category === activeCategory);
      });

      filterProducts();
      closeMenu();
    });
  });


  // =======================
  // SEARCH INPUTS
  // =======================
  if (searchDesktop) searchDesktop.addEventListener("input", filterProducts);
  if (searchMobile) searchMobile.addEventListener("input", filterProducts);


  // =======================
  // DROPDOWN TOGGLE
  // =======================
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });
  }


  // =======================
  // INITIAL LOAD (show all)
  // =======================
  filterProducts();

});



