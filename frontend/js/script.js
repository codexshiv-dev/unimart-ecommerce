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
        const d = document.getElementById("searchInputDesktop");
        const m = document.getElementById("searchInputMobile");
        const query = (d?.value || m?.value || "").trim();

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

        try {
            if (loader) loader.style.display = "flex";
            if (content) content.style.display = "none";

            // ✅ REAL-WORLD FUTURE PROOFING: Automatically uses UniMartConfig registry maps!
            const productGateway = UniMartConfig.getEndpoint('products');
            const res = await fetch(productGateway);
            
            if (!res.ok) throw new Error("Could not pipe live stock from network databases.");
            products = await res.json();
            
            if (loader) loader.style.display = "none";
            if (content) content.style.display = "block";

            syncSearchFromURL();
            renderPage(1);
        } catch (err) {
            console.error("[Network Fatal Error] Storefront runtime connection drop:", err);
            if (loader) {
                loader.innerHTML = `
                    <div style="text-align:center; padding:40px; color:#ef4444; font-weight:600;">
                        ⚠️ Network Outage. Failed to fetch catalog items.<br>
                        <small style="color:#64748b; font-weight:400;">Verify backend server deployment connectivity.</small>
                    </div>`;
            }
        }
    }

    // ==========================================
    // 🔍 ENGINE MEMORY SEARCH & FILTER FILTERS
    // ==========================================
    function getFilteredProducts() { 
        const d = document.getElementById("searchInputDesktop");
        const m = document.getElementById("searchInputMobile");
        let query = (d?.value || m?.value || "").toLowerCase().trim();  

        if (!query) {
            const params = new URLSearchParams(window.location.search);
            query = (params.get("search") || "").toLowerCase().trim();
            if (query) {
                if (d) d.value = query;
                if (m) m.value = query;
            }
        }
      
        return products.filter(p => {
            const name = (p.name || "").toLowerCase();
            const cat = (p.category || "").toLowerCase();
            const desc = (p.description || "").toLowerCase();
            
            const matchesQuery = name.includes(query) || cat.includes(query) || desc.includes(query);
            const matchesCategory = activeCategory === "all" || cat === activeCategory.toLowerCase();
      
            return query !== "" ? matchesQuery : matchesCategory;
        });
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
            const isOutOfStock = product.stockQuantity === 0 || product.stock === 0; 
            if (isOutOfStock) {
                card.classList.add("out-of-stock");
                card.style.opacity = "0.6";
                card.style.pointerEvents = "none";
            }

            const stockBadge = isOutOfStock ? `<span class="out-badge">OUT OF STOCK</span>` : "";
           
            // Ribbon System Badges
            let ribbon = "";
            if (product.isNew) ribbon += `<span class="ribbon new">NEW</span>`;
            if (product.isFeatured) ribbon += `<span class="ribbon featured">FEATURED</span>`;
            if (product.isBestSeller) ribbon += `<span class="ribbon best-seller">BESTSELLER</span>`;

            // Star Ratings Engine Injection
            let stars = "";
            if (product.ratings) {
                const fullStars = Math.floor(product.ratings);
                const halfStar = product.ratings % 1 >= 0.5 ? 1 : 0;
                const emptyStars = 5 - fullStars - halfStar;
                stars += '<div class="rating" style="color:#fbbf24; margin-bottom:6px;">';
                stars += '★'.repeat(fullStars);
                stars += '½'.repeat(halfStar);
                stars += '☆'.repeat(emptyStars);
                stars += '</div>';
            }

            card.innerHTML = `
                <div class="product-img" style="position:relative; overflow:hidden;">
                     ${ribbon}
                     ${stockBadge}
                     <img src="${product.images?. || '../assets/images/no-image.png'}" alt="${sanitizeHTML(product.name)}" loading="lazy">
                     <span class="wishlist" aria-label="Add to wishlist"><i class="fa fa-heart"></i></span>
                </div>
                <div class="product-info">
                     ${stars}
                     <h3 class="product-title">${sanitizeHTML(product.name)}</h3>
                     <p class="short-desc">${sanitizeHTML(truncateString(product.description, 70))}</p>
                     <div class="price-row">
                         <span class="price">₹${product.price.toLocaleString('en-IN')}</span>
                         ${product.oldPrice ? `<span class="old-price" style="text-decoration: line-through; color:#94a3b8; font-size:13px; margin-left:6px;">₹${product.oldPrice.toLocaleString('en-IN')}</span>` : ''}
                         ${product.discount ? `<span class="discount" style="color:#22c55e; font-size:12px; font-weight:600; margin-left:auto;">${product.discount}% OFF</span>` : ''}
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
        const params = new URLSearchParams(window.location.search);
        const query = params.get("search");
        if (query) {
            const d = document.getElementById("searchInputDesktop");
            const m = document.getElementById("searchInputMobile");
            if (d) d.value = query;
            if (m) m.value = query;
        }
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