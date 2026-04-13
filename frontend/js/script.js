
//handles filtering, search, pagination, hamburger menu, dropdowns.
document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // GLOBAL STATE
  // =======================
  let products = [];
  let filteredProducts = [];
  let activeCategory = "all";
  let currentPage = 1;
  const productsPerPage = 12;

  // =======================
  // DOM ELEMENTS
  // =======================
  const productGrid = document.getElementById("productGrid");
  const noResult = document.getElementById("noResult");
  const paginationDiv = document.querySelector(".pagination");
  const searchDesktop = document.getElementById("searchInputDesktop");
  const searchMobile = document.getElementById("searchInputMobile");
  const categoryButtons = document.querySelectorAll(".category-card");
  const mobileCategories = document.querySelectorAll(".mobile-category");

  // =======================
  // HELPER: AUTO-CLOSE MOBILE MENU
  // =======================
  const closeMobileMenuUI = () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const overlay = document.getElementById("overlay");
    if (mobileMenu && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("menu-open");
      document.body.style.top = "";
    }
  };

  // =======================
  // FETCH PRODUCTS FROM BACKEND
  // =======================
  async function fetchProducts() {
    const loader = document.getElementById("indexLoader");
    const content = document.getElementById("indexContent");

    try {
      // 1. Ensure loader is visible before starting fetch
      if (loader) loader.style.display = "flex";
      if (content) content.style.display = "none";

      const res = await fetch("https://unimart-ecommerce.onrender.com/api/products");
      products = await res.json();
      filteredProducts = [...products];
      
      // 2. Hide loader and show content before rendering
      if (loader) loader.style.display = "none";
      if (content) content.style.display = "block";

      renderPage(1);
    } catch (err) {
      console.error("Failed to load products:", err);
      // Show error message inside the loader div if fetch fails
      if (loader) {
        loader.innerHTML = `<p style="color:red;">Error loading products. Please check your connection.</p>`;
      }
    }
  }

  

 // =======================
  // FILTER PRODUCTS (FIXED)
  // =======================
  function getFilteredProducts() {
  const searchDesktop = document.getElementById("searchInputDesktop");
  const searchMobile = document.getElementById("searchInputMobile");
  
  // 1. Standardize search input
  const searchVal = searchDesktop?.value || searchMobile?.value || "";
  const query = searchVal.toLowerCase().trim();

  return products.filter(p => {
    // 2. Safe Data Handling (Backend names often vary)
    const name = p.name?.toLowerCase() || "";
    const category = p.category?.toLowerCase() || "";
    const description = p.description?.toLowerCase() || "";
    const selectedCat = activeCategory.toLowerCase();

    // 3. Logic: If user is typing, search the whole store. 
    // If not, filter by category.
    const matchesQuery = name.includes(query) || 
                         category.includes(query) || 
                         description.includes(query);

    const matchesCategory = selectedCat === "all" || category === selectedCat;

    // Senior Approach: Search overrides category filter for better UX
    if (query !== "") {
      return matchesQuery; 
    }
    
    return matchesCategory;
  });
}

  // =======================
  // RENDER PRODUCTS
  // =======================
  function renderProducts(productsToRender) {
    productGrid.innerHTML = "";

    if (!productsToRender.length) {
      noResult.style.display = "block";
      noResult.innerHTML = `
        <div class="no-result-container">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h2>No products found</h2>
          <p>We couldn't find anything matching "${(searchDesktop?.value || searchMobile?.value || "")}". Try checking your spelling or using different keywords.</p>
          <button class="btn-reset-search" onclick="location.reload()">Clear All Filters</button>
        </div>
      `;
      return;
    } else {
      noResult.style.display = "none";
    }

    productsToRender.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.category = product.category;
      card.dataset.desc = product.description;
      
      // Inside productsToRender.forEach(product => { ...
         const isOutOfStock = product.stockQuantity === 0 || product.stock === 0;
         
         if (isOutOfStock) {
             card.classList.add("out-of-stock"); // Use a CSS class instead of inline styles
             card.style.opacity = "0.5";
             card.style.pointerEvents = "none";
         }
        let stockBadge = isOutOfStock ? `<span class="out-badge ">OUT OF STOCK</span>` : "";
       
      // Ribbon badges
      let ribbon = "";
      if (product.isNew) ribbon += `<span class="ribbon new">NEW</span>`;
      if (product.isFeatured) ribbon += `<span class="ribbon featured">FEATURED</span>`;
      if (product.isBestSeller) ribbon += `<span class="ribbon best-seller">BESTSELLER</span>`;


      // Star ratings
      let stars = "";
      if (product.ratings) {
        const fullStars = Math.floor(product.ratings);
        const halfStar = product.ratings % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        stars += '<div class="rating">';
        stars += '★'.repeat(fullStars);
        stars += '½'.repeat(halfStar);
        stars += '☆'.repeat(emptyStars);
        stars += '</div>';
      }

      card.innerHTML = `
       
        <div class="product-img">
         ${ribbon}
         ${stockBadge}
          <img src="${product.images?.[0] || '../assets/images/no-image.png'}" alt="${product.name}" loading="lazy">
          <span class="wishlist" aria-label="Add to wishlist"><i class="fa fa-heart"></i></span>
        </div>

        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="short-desc">${product.description}</p>
          
          <div class="price-row">
            <span class="price">₹${product.price}</span>
            ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice}</span>` : ''}
            ${product.discount ? `<span class="discount">${product.discount}% OFF</span>` : ''}
          </div>
          ${stars}
        </div>
      `;

      card.onclick = () => {
        window.location.href = `product.html?id=${product._id}`;
      };

      productGrid.appendChild(card);
    });
  }

  // =======================
  // PAGINATION & NAVIGATION
  // =======================
  function renderPagination(productsToRender) {
    paginationDiv.innerHTML = "";
    const totalPages = Math.ceil(productsToRender.length / productsPerPage);
    if (totalPages <= 1) return;

    const createBtn = (text, targetPage, active = false, disabled = false) => {
        const btn = document.createElement("button");
        btn.textContent = text;
        if (active) btn.className = "active";
        btn.disabled = disabled;
        btn.onclick = () => renderPage(targetPage);
        return btn;
    };

    paginationDiv.appendChild(createBtn("Previous", currentPage - 1, false, currentPage === 1));

    for (let i = 1; i <= totalPages; i++) {
      paginationDiv.appendChild(createBtn(i, i, i === currentPage));
    }

    paginationDiv.appendChild(createBtn("Next", currentPage + 1, false, currentPage === totalPages));
  }

  function renderPage(page) {
    currentPage = page;
    const filtered = getFilteredProducts();
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    renderProducts(filtered.slice(start, end));
    renderPagination(filtered);
  }

  // Assign to global variable so Layout.js can call it
  resetPageAndRender = () => { renderPage(1); };
    

  // =======================
  // RENDER PAGE
  // =======================
  function renderPage(page) {
    currentPage = page;
    const filtered = getFilteredProducts();
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    renderProducts(filtered.slice(start, end));
    renderPagination(filtered);
  }

  // =======================
  // CATEGORY & SEARCH EVENTS
  // =======================
  function resetPageAndRender() { renderPage(1); }

  categoryButtons.forEach(btn => btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category;
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mobileCategories.forEach(b => b.classList.toggle("active", b.dataset.category === activeCategory));
    resetPageAndRender();
  }));

  mobileCategories.forEach(btn => btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category;
    mobileCategories.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    categoryButtons.forEach(b => b.classList.toggle("active", b.dataset.category === activeCategory));
    resetPageAndRender();
  }));

  searchDesktop?.addEventListener("input", resetPageAndRender);
  searchMobile?.addEventListener("input", resetPageAndRender);

  // =======================
  // DROPDOWN TOGGLE
  // =======================
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");
  dropdownToggle?.addEventListener("click", () => dropdownMenu.classList.toggle("show"));

  // =======================
  // INITIAL LOAD
  // =======================
  fetchProducts();

  // load count on page load 
  // updateCartCount();

 
  dropdownToggle?.addEventListener("click", () => dropdownMenu.classList.toggle("show"));

});

