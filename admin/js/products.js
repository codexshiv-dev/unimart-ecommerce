// ======================================================
// UNIMART ADMIN PANEL - PRODUCTS LIVE DATA ENGINE (API MODE)
// ======================================================

// Run-time data array cache state mapping
let products = [];
window.products = products;

// ======================================================
// 🛡️ SECURITY LAYER: TEXT SANITIZER PIPELINE (Prevents XSS Exploits)
// ======================================================
function sanitizeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ======================================================
// ✨ VISUAL ACCESSIBILITY: SKELETON LOADER ENGINE
// ======================================================
function renderSkeletonRows() {
  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;

  // Renders 5 pulse-animation rows so the client knows it's loading data
  tbody.innerHTML = Array(5).fill(0).map(() => `
    <tr class="skeleton-row" style="opacity: 0.7;">
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 16px; background: #e2e8f0; border-radius: 4px; width: 20px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 44px; width: 44px; background: #e2e8f0; border-radius: 8px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 16px; background: #e2e8f0; border-radius: 4px; width: 140px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 14px; background: #e2e8f0; border-radius: 4px; width: 80px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 20px; background: #e2e8f0; border-radius: 50px; width: 70px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 16px; background: #e2e8f0; border-radius: 4px; width: 60px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;">
        <div style="height: 14px; background: #e2e8f0; border-radius: 4px; width: 40px; animation: tablePulse 1.5s infinite ease-in-out; margin-bottom: 4px;"></div>
        <div style="height: 10px; background: #e2e8f0; border-radius: 4px; width: 55px; animation: tablePulse 1.5s infinite ease-in-out;"></div>
      </td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 28px; background: #e2e8f0; border-radius: 50px; width: 85px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 18px; background: #e2e8f0; border-radius: 4px; width: 65px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
      <td style="padding: 16px; vertical-align: middle;"><div style="height: 32px; background: #e2e8f0; border-radius: 6px; width: 70px; animation: tablePulse 1.5s infinite ease-in-out;"></div></td>
    </tr>
  `).join("");

  if (!document.getElementById("skeleton-pulse-css")) {
    const style = document.createElement("style");
    style.id = "skeleton-pulse-css";
    style.innerHTML = `@keyframes tablePulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`;
    document.head.appendChild(style);
  }
}

// ======================================================
// CORE DATA FETCHING PIPELINE (MongoDB Integration)
// ======================================================
async function fetchProductsFromBackend() {
  try {
    // ✨ CHANGE: Show skeleton placeholders immediately while waiting for API stream
    renderSkeletonRows();

    const targetUrl = window.UniMartConfig.getEndpoint('products');
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP Error Status: ${response.status}`);
    
    const envelope = await response.json();
    products = envelope.data ? envelope.data : envelope;
    
    if (!Array.isArray(products)) {
       products = [];
    }

    window.products = products;
    filterProducts(); 
  } catch (err) {
    console.error("❌ Failed to stream products from backend connection:", err);
    window.showToast("Could not sync product data from server.", "error");
    
    const tbody = document.getElementById("productsTableBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 48px; color: #ef4444; font-weight: 500;">⚠️ Connection error. Please check server.</td></tr>`;
    }
  }
}

// ======================================================
// REAL-TIME DATAGRID UI RENDER ENGINE
// ======================================================
function renderProducts(productList = products) {
  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (productList.length === 0) {
    if (typeof window.renderEmptyProductsState === "function") {
      window.renderEmptyProductsState();
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 48px; color: #94a3b8; font-weight: 500;">
            <div style="font-size: 32px; margin-bottom: 12px;">📦</div>
            No matching product inventory records located in stock.
          </td>
        </tr>`;
    }
    return;
  }

  const fragment = document.createDocumentFragment();

  productList.forEach((product, index) => {
   
    // PRODUCTION READY: Use your local assets, not random Unsplash URLs
    const coverImage =(product.images && product.images.length > 0) ? product.images[0]
     : "../assets/images/no-image.png";

    let badgeHTML = "";
    if (product.isFeatured) badgeHTML += `<span style="background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-right:2px; white-space:nowrap;">⭐ Featured</span>`;
    if (product.isNew) badgeHTML += `<span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-right:2px; white-space:nowrap;">✨ New</span>`;
    if (product.isBestSeller) badgeHTML += `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-right:2px; white-space:nowrap;">🔥 Hot</span>`;
    if (!badgeHTML) badgeHTML = "-";

    const actualStock = product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || 0);
    const rawStatus = (product.status || "active").toLowerCase().trim();
    
    const bgStyle = rawStatus === "active" ? "#e6f4ea" : "#fce8e6";
    const textStyle = rawStatus === "active" ? "#137333" : "#c5221f";
   
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600; color: #64748b; vertical-align: middle;">${index + 1}</td>
      <td style="vertical-align: middle;"><img src="${sanitizeHTML(coverImage)}" class="product-img" style="width:44px; height:44px; object-fit:cover; border-radius:8px;" alt="Thumbnail"></td>
      <td style="font-weight: 500; vertical-align: middle;">${sanitizeHTML(product.name)}</td>
      <td style="font-family: monospace; font-size: 12px; color: #64748b; vertical-align: middle;">${sanitizeHTML(product.sku || 'N/A')}</td>
      <td style="vertical-align: middle;"><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${sanitizeHTML(product.category || 'Generic')}</span></td>
      <td style="vertical-align: middle;">
        <span style="font-weight: 600;">Rs. ${Number(product.price || 0).toLocaleString('en-NP')}</span>
        ${product.oldPrice ? `<br><span style="text-decoration: line-through; font-size: 11px; color: #94a3b8;">Rs. ${Number(product.oldPrice).toLocaleString('en-NP')}</span>` : ""}
      </td>
      <td style="vertical-align: middle;">
        <div style="font-weight: 600; color: ${actualStock > 5 ? '#10b981' : actualStock > 0 ? '#f59e0b' : '#ef4444'}; font-size: 13px; line-height: 1.2;">
          ${actualStock} pcs
        </div>
        <div style="font-size: 10px; color: #94a3b8; font-weight: 500; margin-top: 2px;">
          ${actualStock > 0 ? 'In Stock' : 'Out of Stock'}
        </div>
      </td>
      
      <td style="vertical-align: middle;">
        <select 
          class="inline-status-dropdown" 
          data-id="${product._id}"
          style="
            background-color: ${bgStyle}; 
            color: ${textStyle}; 
            border: 1px solid transparent; 
            padding: 6px 28px 6px 12px; 
            border-radius: 50px; 
            font-size: 12px; 
            font-weight: 600; 
            cursor: pointer; 
            outline: none;
            font-family: inherit;
            appearance: none;
            -webkit-appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"${encodeURIComponent(textStyle)}\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>');
            background-repeat: no-repeat;
            background-position: calc(100% - 10px) center;
            transition: all 0.2s ease;
          ">
          <option value="active" ${rawStatus === "active" ? "selected" : ""}>Active</option>
          <option value="inactive" ${rawStatus === "inactive" ? "selected" : ""}>Inactive</option>
        </select>
      </td>

      <td style="vertical-align: middle;">
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">${badgeHTML}</div>
      </td>
      <td style="vertical-align: middle;">
        <div class="action-btn-container">
          <button class="action-btn edit-trigger" data-id="${product._id}" title="Edit Product">✏️</button>
          <button class="action-btn delete-trigger" data-id="${product._id}" title="Delete Product">🗑️</button>
        </div>
      </td>
    `;

    tr.querySelector(".inline-status-dropdown").onchange = function(e) {
      updateProductStatusInline(product._id, e.target.value, e.target);
    };

    tr.querySelector(".edit-trigger").onclick = () => editProduct(product._id);
    tr.querySelector(".delete-trigger").onclick = () => deleteProduct(product._id);

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

// ======================================================
// LIVE INLINE STATUS WRITER (✨ CHANGE: SOLID STATE HYBRID PATCH/PUT ENGINE)
// ======================================================
// ======================================================
// LIVE INLINE STATUS WRITER (FIXED)
// ======================================================
async function updateProductStatusInline(productId, newStatus, selectElement) {
  // REMOVED: if (req.body.status)... (This was causing your crash)

  try {
    selectElement.style.opacity = "0.5";
    const response = await fetch(`${window.UniMartConfig.getEndpoint('products')}/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }) // This sends the data to your backend
    });

    if (!response.ok) throw new Error("Update failed");

    // CRITICAL: Update the global array so the UI reflects the new state
    const prodIndex = products.findIndex(p => p._id === productId);
    if (prodIndex !== -1) {
      products[prodIndex].status = newStatus;
    }

    window.showToast("Status updated!", "success");
  } catch (err) {
    window.showToast("Error: " + err.message, "error");
    // Revert select back to original value
    selectElement.value = products.find(p => p._id === productId)?.status || "active";
  } finally {
    selectElement.style.opacity = "1";
  }
}
// ======================================================
// ASYNCHRONOUS SECURE PRODUCT PURGE SYSTEM
// ======================================================
async function deleteProduct(id) {
  const targetProduct = products.find(p => p._id === id);
  if (!targetProduct) {
    window.showToast("The product record could not be found.", "error");
    return;
  }

  const confirmed = await window.requestCustomConfirmation(
    "Delete Catalog Product?",
    `Are you absolutely sure you want to completely erase "${targetProduct.name}" from the database?`,
    "danger"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`${window.UniMartConfig.getEndpoint('products')}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error("Delete transaction execution failed.");

    window.showToast(`Product "${targetProduct.name}" removed from database.`, "success");
    fetchProductsFromBackend(); 
  } catch (err) {
    console.error(err);
    window.showToast("Failed to delete product from server.", "error");
  }
}

// ======================================================
// PRODUCT DATA EDIT FORMS HYDRATION ENGINE
// ======================================================
function editProduct(id) {
  const product = products.find(p => p._id === id);
  if (!product) {
    console.error("Product not found in local cache!");
    return;
  };

  if (typeof window.openModal === "function") {
    window.openModal();
  }

  document.getElementById("productId").value = product._id;
  document.getElementById("pName").value = product.name || "";
  document.getElementById("pSku").value = product.sku || "";
  
  const catInput = document.getElementById("pCategory");
  if (catInput && product.category) {
    catInput.value = product.category.toLowerCase().trim().replace(/\s+/g, "-");
  }
  
  document.getElementById("pPrice").value = product.price || 0;
  document.getElementById("pOldPrice").value = product.oldPrice || ""; 
  document.getElementById("pStock").value = product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || 0);

  const statusInput = document.getElementById("pStatus") || document.getElementById("pstatus");
  if (statusInput) {
    // Ensure we handle the value safely
    const savedStatus = (product.status || "active").toLowerCase().trim();
    statusInput.value = savedStatus;
    console.log("Setting Modal Status to:", savedStatus); // Debug this in your console!
  }

  document.getElementById("pIsFeatured").checked = !!product.isFeatured;
  document.getElementById("pIsNew").checked = !!product.isNew;
  document.getElementById("pIsBestSeller").checked = !!product.isBestSeller;
  
  document.getElementById("pDescription").value = product.description || "";
  document.getElementById("pRating").value = product.ratings || "5.0";

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.textContent = "Edit Existing Product";

  if (typeof window.loadImagesToGallery === "function") {
    window.loadImagesToGallery(product.images || []);
  }

  if (typeof window.loadTagsToEngine === "function") {
    window.loadTagsToEngine(product.tags || []);
  }
}

// ======================================================
// INTERFACE FORM BOUND INTERACTION CONTROLLERS
// ======================================================
function bindProductFormSubmit() {
  const form = document.getElementById("productForm");
  if (!form) return;

  form.onsubmit = async function (e) {
    e.preventDefault();

    const id = document.getElementById("productId").value;
    const nameVal = document.getElementById("pName").value.trim();

    if (!nameVal) {
      window.showToast("Product title cannot be blank!", "warning");
      return;
    }

    // Capture gallery images
    let galleryImages = [];
    if (window.uploadedImagesBase64 && window.uploadedImagesBase64.length > 0) {
      galleryImages = window.uploadedImagesBase64;
    }

    // Capture Tags
    let collectedTags = [];
    if (typeof window.getCurrentProductTags === "function") {
      collectedTags = window.getCurrentProductTags();
    }

    const catSelect = document.getElementById("pCategory");
    let displayCategory = "Generic";
    if (catSelect && catSelect.selectedIndex > 0) {
      displayCategory = catSelect.options[catSelect.selectedIndex].text.replace(/^[\s\S]*?\s+/, "");
    }

    const oldPriceVal = document.getElementById("pOldPrice").value;
    const statusVal = document.getElementById("pStatus")?.value || "active";

    console.log("Saving images:", window.uploadedImagesBase64);

    // SINGLE DEFINITION OF PAYLOAD
    const productPayload = {
      name: nameVal,
      sku: document.getElementById("pSku").value.trim() || `GEN-${Math.floor(100000 + Math.random() * 900000)}`,
      category: displayCategory,
      price: Number(document.getElementById("pPrice").value) || 0,
      oldPrice: oldPriceVal ? Number(oldPriceVal) : null,
      stockQuantity: Number(document.getElementById("pStock").value) || 0,
      status: statusVal,
      ratings: document.getElementById("pRating").value ? Number(document.getElementById("pRating").value) : 5.0,
      description: document.getElementById("pDescription").value.trim(),
      images: galleryImages,
      tags: collectedTags,
      isFeatured: document.getElementById("pIsFeatured").checked,
      isNew: document.getElementById("pIsNew").checked,
      isBestSeller: document.getElementById("pIsBestSeller").checked
    };

    try {
      let url = window.UniMartConfig.getEndpoint('products');
      let method = 'POST';

      if (id) {
        url = `${url}/${id}`;
        method = 'PATCH';
      }
      console.log("Images Before Save:", window.uploadedImagesBase64);
      console.log("Final Payload:", productPayload);
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      if (!response.ok) throw new Error("Failed to write product data payload.");

      window.showToast(`Product processed successfully!`, "success");
      fetchProductsFromBackend();

      if (typeof window.closeModal === "function") {
        window.closeModal();
      }
    } catch (err) {
      console.error(err);
      window.showToast("Network save transactional breakdown occurred.", "error");
    }
  };
}

// ======================================================
// SEARCH + LIVE DATA FILTER MATRIX
// ======================================================
function filterProducts() {
  const search = document.getElementById("searchProduct")?.value.toLowerCase() || "";
  const category = document.getElementById("categoryFilter")?.value || "";
  const statusFilterVal = document.getElementById("statusFilter")?.value || "";

  const currentWorkingList = Array.isArray(products) ? products : [];

  const filtered = currentWorkingList.filter(product => {
    const matchesSearch = (product.name || "").toLowerCase().includes(search) || (product.sku || "").toLowerCase().includes(search);
    
    const productCatSlug = (product.category || "Generic").toLowerCase().trim().replace(/\s+/g, "-");
    const matchesCategory = !category || productCatSlug === category.toLowerCase();
    
    const actualStock = product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || 0);
    const rawStatus = (product.status || "active").toLowerCase().trim();
    
    let matchesStatus = true;
    if (statusFilterVal === "In Stock") {
      matchesStatus = actualStock > 0;
    } else if (statusFilterVal === "Out Of Stock") {
      matchesStatus = actualStock <= 0;
    } else if (statusFilterVal === "active" || statusFilterVal === "Active") {
      matchesStatus = rawStatus === "active";
    } else if (statusFilterVal === "inactive" || statusFilterVal === "Inactive") {
      matchesStatus = rawStatus === "inactive";
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  renderProducts(filtered);
}

// ======================================================
// ALGORITHMIC AUTOMATED CODE COGNIZANT SKU GENERATOR
// ======================================================
function autoGenerateSKU() {
  const nameInput = document.getElementById("pName") || document.getElementById("pname");
  const categoryInput = document.getElementById("pCategory") || document.getElementById("pcategory");
  const skuInput = document.getElementById("pSku") || document.getElementById("psku");
  const idInput = document.getElementById("productId") || document.getElementById("productid");

  if (!nameInput || !skuInput) return;

  if (idInput && idInput.value.trim() !== "") {
    return;
  }

  const nameValue = nameInput.value.trim();
  if (!nameValue) {
    skuInput.value = "";
    return;
  }

  let catPrefix = "GEN"; 
  
  if (categoryInput && categoryInput.selectedIndex > 0) {
    const selectedOptionText = categoryInput.options[categoryInput.selectedIndex].text;
    
    let cleanText = selectedOptionText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "");
    cleanText = cleanText.replace(/[^a-zA-Z]/g, "").trim().toUpperCase();

    if (cleanText) {
      let consonants = cleanText.replace(/[AEIOU]/gi, '');
      if (consonants.length < 2) {
        consonants = cleanText;
      }
      catPrefix = consonants.substring(0, 3).padEnd(3, 'X');
    }
  }

  const cleanName = nameValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const namePrefix = cleanName.substring(0, 3).padEnd(3, "X");
  
  const randomNum = Math.floor(100 + Math.random() * 900);

  const calculatedSKU = `${catPrefix}-${namePrefix}-${randomNum}`;
  skuInput.value = calculatedSKU;
}

// Global System Module API Exports
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
window.renderProducts = renderProducts;
window.filterProducts = filterProducts;
window.autoGenerateSKU = autoGenerateSKU;

// ======================================================
// INITIALIZATION LIFE AUTOMATION LISTENERS
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  fetchProductsFromBackend(); 
  bindProductFormSubmit();

  document.getElementById("searchProduct")?.addEventListener("input", filterProducts);
  document.getElementById("categoryFilter")?.addEventListener("change", filterProducts);
  document.getElementById("statusFilter")?.addEventListener("change", filterProducts);

  const nameField = document.getElementById("pName") || document.getElementById("pname");
  const catField = document.getElementById("pCategory") || document.getElementById("pcategory");

  if (nameField) nameField.addEventListener("input", autoGenerateSKU);
  if (catField) catField.addEventListener("change", autoGenerateSKU);

  const addBtn = document.getElementById("addProductBtn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const idInput = document.getElementById("productId") || document.getElementById("productid");
      const skuInput = document.getElementById("pSku") || document.getElementById("psku");
      const nameInput = document.getElementById("pName") || document.getElementById("pname");
      const catInput = document.getElementById("pCategory");
      const statusInput = document.getElementById("pStatus") || document.getElementById("pstatus");
      
      if (idInput) idInput.value = ""; 
      if (nameInput) nameInput.value = "";
      if (catInput) catInput.value = ""; 
      if (skuInput) skuInput.value = ""; 
      if (statusInput) statusInput.value = "active";
      
      const modalTitle = document.getElementById("modalTitle");
      if (modalTitle) modalTitle.textContent = "Add New Product";
    });
  }
}); 