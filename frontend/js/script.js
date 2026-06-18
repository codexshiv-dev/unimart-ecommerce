/**
 * ==========================================================================
 * 🛒 UNIMART PRODUCTION STOREFRONT MOTOR ENGINE (FUTURE-PROOF & SCALABLE)
 * ==========================================================================
 */
document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 🧠 CENTRAL ARCHITECTURAL DATA CORE STATES
    // ==========================================
    let products = [];
    let activeCategory = "all";
    let currentPage = 1;
    const productsPerPage = 12;

    // ==========================================
    // 🎛️ CORE DOM LAYOUT SELECTORS REF NODES
    // ==========================================
    const productGrid = document.getElementById("productGrid");
    const noResult = document.getElementById("noResult");
    const paginationDiv = document.querySelector(".pagination");
    const searchDesktop = document.getElementById("searchInputDesktop");
    const searchMobile = document.getElementById("searchInputMobile");
    const categoryButtons = document.querySelectorAll(".category-card");
    const mobileCategories = document.querySelectorAll(".mobile-category");

    // ==========================================
    // ⚙️ INJECT DECOUPLED HOOK ROUTER GATEWAYS
    // ==========================================
    window.resetPageAndRender = () => { 

        const query = (searchDesktop?.value || searchMobile?.value || "").trim();

        if (!query) {
            const url = new URL(window.location);
            url.searchParams.delete('search');
            window.history.pushState({}, '', url);
        }

        currentPage = 1;
        renderPage(1);
    };

    // ==========================================
    // 📥 REST API NETWORKING SUBSYSTEM
    // ==========================================
    async function fetchProducts() {
        const loader = document.getElementById("indexLoader");
        const content = document.getElementById("indexContent");

        // 1. SHOW SKELETON IMMEDIATELY
        renderSkeletonCards();

        try {
            if (loader) loader.style.display = "flex";
            if (content) content.style.display = "none";

            // ✅ REAL-WORLD FUTURE PROOFING: Automatically uses UniMartConfig registry maps!
            const productGateway = UniMartConfig.getEndpoint('products');
            const res = await fetch(productGateway);
            
            if (!res.ok) throw new Error("Could not pipe live stock from network databases.");
           const envelope = await res.json();

           products = Array.isArray(envelope.data)
               ? envelope.data
               : Array.isArray(envelope)
               ? envelope
               : [];
            
            if (loader) loader.style.display = "none";
            if (content) content.style.display = "block";

            syncSearchFromURL();
            renderPage(1);
       } catch (err) {
            console.error("[Network Fatal Error] Storefront runtime connection drop:", err);
            
            // This is the correct place for the error state
            if (productGrid) {
                productGrid.innerHTML = `
                <div class="error-state" style="grid-column: 1/-1; text-align:center; padding: 60px;">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;">
                      <path d="M1 1l22 22M16.72 11.08A6 6 0 0 0 7.28 11.08M21.1 6.7a10 10 0 0 0-14.14 0M12 20h.01"></path>
                    </svg>
                    <h3 style="color:#1e293b;">Oops! Catalog unavailable</h3>
                    <p style="color:#64748b; margin-bottom:20px;">Please check your connection and try again.</p>
                    <button onclick="window.location.reload()" style="padding:10px 25px; background:#ff9f00; color:#fff; border:none; border-radius:5px; cursor:pointer;">
                        Retry Connection
                    </button>
                </div>`;
            }
        }
    }

    // ==========================================
    // 🔍 ENGINE MEMORY SEARCH & FILTER FILTERS
    // ==========================================
    function getFilteredProducts() { 
       
        let query = (searchDesktop?.value || searchMobile?.value || "").trim();

        if (!query) {
            const params = new URLSearchParams(window.location.search);
            query = (params.get("search") || "").toLowerCase().trim();
            if (query) {
                if (searchDesktop) searchDesktop.value = query;
                if (searchMobile) searchMobile.value = query;
            }
        }
      
        return products.filter(p => {
            
           if (p.status !== "active") return false; // Use 'p' to match the parameter


            const name = (p.name || "").toLowerCase();
            const cat = (p.category || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            
            const matchesQuery = name.includes(query) || cat.includes(query) || desc.includes(query);
            const matchesCategory = activeCategory === "all" || cat === activeCategory.toLowerCase();
      
            return matchesCategory && (query === "" || matchesQuery);
        });
    }
    // ==========================================
    // 🎨Dynamic Discount
    // ==========================================
    function getDiscountPercentage(product) {

    if (
        !product.oldPrice ||
        product.oldPrice <= product.price
    ) {
        return 0;
    }

    return Math.round(
        (
            (product.oldPrice - product.price)
            /
            product.oldPrice
        ) * 100
    );
    }

  //Extract Ribbon Helper function
  function getRibbonHTML(product) {

    let ribbon = "";

    if (product.isNew)
        ribbon +=
        `<span class="ribbon new">NEW</span>`;

    if (product.isFeatured)
        ribbon +=
        `<span class="ribbon featured">FEATURED</span>`;

    if (product.isBestSeller)
        ribbon +=
        `<span class="ribbon best-seller">BESTSELLER</span>`;

    return ribbon;
  }

    //Extract Ratting Helper function
    function getRatingHTML(product) {

    if (!product.ratings)
        return "";

    const fullStars =
        Math.floor(product.ratings);

    const halfStar =
        product.ratings % 1 >= 0.5
            ? 1
            : 0;

    const emptyStars =
        5 - fullStars - halfStar;

    return `
    <div class="rating">
        ${'★'.repeat(fullStars)}
        ${halfStar ? '½' : ''}
        ${'☆'.repeat(emptyStars)}
    </div>
    `;
    }
    function renderSkeletonCards() {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;
    
    // Create 8 skeleton cards (adjust as needed for your row size)
    productGrid.innerHTML = Array(8).fill(0).map(() => `
        <div class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-text" style="width: 80%;"></div>
            <div class="skeleton-text" style="width: 60%;"></div>
            <div class="skeleton-text" style="width: 40%;"></div>
        </div>
    `).join("");
    }

    // ==========================================
    // 🎨 RENDER INTERACTION CATALOG PIPELINE
    // ==========================================
    function renderProducts(productsToRender) {
        if (!productGrid) return;
        productGrid.innerHTML = "";

        if (!productsToRender.length) {
            if (noResult) {
                noResult.style.display = "block";
                const currentQuery = (searchDesktop?.value || searchMobile?.value || "");
                noResult.innerHTML = `
                    <div class="no-result-container" style="text-align:center; padding: 50px 20px;">
                        <i class="fa-solid fa-magnifying-glass" style="font-size: 32px; color: #94a3b8; margin-bottom: 15px;"></i>
                        <h2 style="font-size: 20px; color: #1e293b; margin-bottom: 8px;">No products found</h2>
                        <p style="color: #64748b; max-width: 400px; margin: 0 auto 20px;">We couldn't find anything matching "${sanitizeHTML(currentQuery)}". Try checking your spelling or using different keywords.</p>
                        <button class="btn-reset-search" onclick="window.location.href='index.html'" style="cursor:pointer; padding: 10px 20px; border-radius: 6px;">Clear All Filters</button>
                    </div>`;
            }
            return;
        } 
        
        if (noResult) noResult.style.display = "none";

        productsToRender.forEach(product => {
            const card = document.createElement("article");
            card.className = "product-card";
            card.dataset.category = product.category;
            card.dataset.desc = product.description;
            
            // Core Stock Inventory Logic Parsing
            const stock = product.stockQuantity ?? product.stock ?? 0;
            const isOutOfStock = stock <= 0;
            if (isOutOfStock) {
                card.classList.add("out-of-stock");
                // card.style.opacity = "0.6";
                // card.style.pointerEvents = "none";
            }

            const stockBadge = isOutOfStock ? `<span class="out-badge">OUT OF STOCK</span>` : "";
           
            // Ribbon System Badges function call
            const ribbon = getRibbonHTML(product);
    

            // Star Ratings Engine function call
            const stars = getRatingHTML(product);
            

            const productImage = product.images?.[0] || "../assets/images/no-image.png";

            card.innerHTML = `
                <div class="product-img" style="position:relative; overflow:hidden;">
                     ${ribbon}
                     ${stockBadge}

                     <img src="${productImage}" alt="${sanitizeHTML(product.name)}" loading="lazy">
                     <span class="wishlist" aria-label="Add to wishlist"><i class="fa fa-heart"></i></span>
                </div>
                <div class="product-info">
                     ${stars}
                     <h3 class="product-title">${sanitizeHTML(product.name)}</h3>
                     <p class="short-desc">${sanitizeHTML(truncateString(product.description, 70))}</p>
                     <div class="price-row">
                         <span class="price">₹${product.price.toLocaleString('en-IN')}</span>
                         ${product.oldPrice ? `<span class="old-price">₹${product.oldPrice.toLocaleString('en-IN')}</span>` : ''}
                         ${getDiscountPercentage(product) > 0
                           ? `
                           <span class="discount">
                              ${getDiscountPercentage(product)}% OFF
                           </span>
                           `
                           : ''}
                     </div>
                </div>
            `;

            card.onclick = () => {
                window.location.href = `product.html?id=${product._id}`;
            };

            productGrid.appendChild(card);
        });
    }

    // ==========================================
    // 🔢 PAGINATION CONTROL SUBSYSTEMS
    // ==========================================
    function renderPage(page) {
        currentPage = page;
        const filtered = getFilteredProducts();
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        renderProducts(filtered.slice(start, end));
        renderPagination(filtered);
    }

    function renderPagination(productsToRender) {
        if (!paginationDiv) return;
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

    // ==========================================
    // ⚡ INTERACTIVE DATA CONTEXT EVENT LOOPS
    // ==========================================
    categoryButtons.forEach(btn => btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category;
        categoryButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        mobileCategories.forEach(b => b.classList.toggle("active", b.dataset.category === activeCategory));
        window.resetPageAndRender();
    }));

    mobileCategories.forEach(btn => btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category;
        mobileCategories.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        categoryButtons.forEach(b => b.classList.toggle("active", b.dataset.category === activeCategory));
        window.resetPageAndRender();
    }));

    // Explicit delegation mapping targeting context loops cleanly
    document.addEventListener("input", (e) => {
        if (e.target.id === "searchInputDesktop" || e.target.id === "searchInputMobile") {
            window.resetPageAndRender();
        }
    });

   
    function syncSearchFromURL() {

    const query =
        new URLSearchParams(window.location.search)
            .get("search") || "";

    searchDesktop?.setAttribute("value", query);
    searchMobile?.setAttribute("value", query);

    if (searchDesktop) searchDesktop.value = query;
    if (searchMobile) searchMobile.value = query;
   }

    // ==========================================
    // 👤 NAVIGATION INTERACTIVE HANDLERS
    // ==========================================
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    dropdownToggle?.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownMenu?.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        if (dropdownMenu?.classList.contains("show")) {
            dropdownMenu.classList.remove("show");
        }
    });

    // ==========================================
    // 🛠️ UTILITY HELPER FUNCTIONS (ANTI-XSS)
    // ==========================================
    function sanitizeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function truncateString(str, num) {
        if (!str) return "";
        if (str.length <= num) return str;
        return str.slice(0, num) + "...";
    }

    // EXECUTE CATALOG INSTANCE FETCH RUN
    fetchProducts();
});