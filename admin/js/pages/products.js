(() => {
  let categories = [];
  let currentPage = 1;
  const PAGE_LIMIT = 20;
  let currentImages = []; // [{url, publicId}] for the open form modal
  let editingProduct = null;
  let isUploading = false;

  const cardBody = () => document.getElementById("productsCardBody");
  const paginationEl = () => document.getElementById("productsPagination");

  const getFilters = () => ({
    search: document.getElementById("productSearchInput")?.value.trim() || "",
    category: document.getElementById("productCategoryFilter")?.value || "all",
    onlyActive: document.getElementById("productStatusFilter")?.value === "active" ? "true" : "",
  });

  // ---- Category loading (shared by filter dropdown + form select) ----

  const loadCategoriesInto = async () => {
    try {
      const res = await AdminCategoryService.getAll();
      categories = res?.data || [];

      const filterSelect = document.getElementById("productCategoryFilter");
      if (filterSelect) {
        const current = filterSelect.value;
        filterSelect.innerHTML = `<option value="all">All categories</option>` +
          categories.map((c) => `<option value="${c.slug}">${AdminFormat.escapeHtml(c.name)}</option>`).join("");
        filterSelect.value = current || "all";
      }
    } catch (error) {
      console.error("[Products] Failed to load categories for filters:", error);
    }
  };

  // ---- List states ----

  const renderLoading = () => {
    paginationEl().classList.add("hidden");
    cardBody().innerHTML = `
      <div class="admin-state">
        <div class="admin-spinner" role="status" aria-label="Loading"></div>
        <p class="admin-state__desc">Loading products…</p>
      </div>
    `;
  };

  const renderError = (message) => {
    paginationEl().classList.add("hidden");
    cardBody().innerHTML = `
      <div class="admin-state">
        <div class="admin-state__icon" aria-hidden="true">⚠</div>
        <div class="admin-state__title">Couldn't load products</div>
        <div class="admin-state__desc">${AdminFormat.escapeHtml(message)}</div>
        <button class="admin-btn admin-btn--primary" id="productsRetryBtn" type="button">Try again</button>
      </div>
    `;
    document.getElementById("productsRetryBtn")?.addEventListener("click", loadProducts);
  };

  const renderEmpty = (hasFilters) => {
    paginationEl().classList.add("hidden");
    cardBody().innerHTML = `
      <div class="admin-state">
        <div class="admin-state__icon" aria-hidden="true">\u25A3</div>
        <div class="admin-state__title">${hasFilters ? "No products match your filters" : "No products yet"}</div>
        <div class="admin-state__desc">${hasFilters ? "Try a different search term or clear your filters." : "Add your first product to start selling."}</div>
        ${hasFilters ? "" : `<button class="admin-btn admin-btn--primary" id="productsEmptyAddBtn" type="button">+ Add Product</button>`}
      </div>
    `;
    document.getElementById("productsEmptyAddBtn")?.addEventListener("click", () => openFormModal(null));
  };

  const renderRow = (product) => {
    const thumb = product.images?.[0]?.url;
    const categoryName = product.category?.name || "—";
    return `
      <tr>
        <td>${thumb ? `<img class="admin-thumb" src="${thumb}" alt="" />` : `<div class="admin-thumb" aria-hidden="true"></div>`}</td>
        <td class="admin-cell-primary admin-cell-truncate" title="${AdminFormat.escapeHtml(product.name)}">${AdminFormat.escapeHtml(product.name)}</td>
        <td class="admin-cell-muted admin-cell-truncate" title="${AdminFormat.escapeHtml(categoryName)}">${AdminFormat.escapeHtml(categoryName)}</td>
        <td>${AdminFormat.currency(product.price)}</td>
        <td class="admin-cell-muted">${product.stockQuantity ?? 0}</td>
        <td><span class="admin-badge admin-badge--${AdminFormat.productStatusBadge(product.status)}">${AdminFormat.escapeHtml(product.status)}</span></td>
        <td>
          <div class="admin-cell-actions">
            <button class="admin-btn admin-btn--secondary admin-btn--sm" data-edit="${product._id}" type="button">Edit</button>
            <button class="admin-btn admin-btn--danger admin-btn--sm" data-delete="${product._id}" type="button">Delete</button>
          </div>
        </td>
      </tr>
    `;
  };

  const renderPagination = (pagination) => {
    if (!pagination || pagination.totalPages <= 1) {
      paginationEl().classList.add("hidden");
      return;
    }
    paginationEl().classList.remove("hidden");
    paginationEl().innerHTML = `
      <button class="admin-btn admin-btn--secondary admin-btn--sm" id="productsPrevBtn" type="button" ${pagination.currentPage <= 1 ? "disabled" : ""}>Previous</button>
      <span class="admin-pagination__info">Page ${pagination.currentPage} of ${pagination.totalPages} · ${pagination.totalItems} products</span>
      <button class="admin-btn admin-btn--secondary admin-btn--sm" id="productsNextBtn" type="button" ${pagination.currentPage >= pagination.totalPages ? "disabled" : ""}>Next</button>
    `;
    document.getElementById("productsPrevBtn")?.addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); loadProducts(); });
    document.getElementById("productsNextBtn")?.addEventListener("click", () => { currentPage += 1; loadProducts(); });
  };

  let productsCache = [];

  const wireRowActions = () => {
    cardBody().querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = productsCache.find((p) => p._id === btn.dataset.edit);
        if (product) openFormModal(product);
      });
    });
    cardBody().querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const product = productsCache.find((p) => p._id === btn.dataset.delete);
        if (product) openDeleteModal(product);
      });
    });
  };

  const loadProducts = async () => {
    renderLoading();
    const filters = getFilters();
    try {
      const res = await AdminProductService.getAll({
        search: filters.search,
        category: filters.category === "all" ? "" : filters.category,
        onlyActive: filters.onlyActive,
        page: currentPage,
        limit: PAGE_LIMIT,
      });

      productsCache = res?.data || [];

      if (productsCache.length === 0) {
        const hasFilters = Boolean(filters.search || filters.category !== "all" || filters.onlyActive);
        renderEmpty(hasFilters);
        return;
      }

      cardBody().innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table admin-table--products">
            <thead>
              <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>${productsCache.map(renderRow).join("")}</tbody>
          </table>
        </div>
      `;
      wireRowActions();
      renderPagination(res?.pagination);
    } catch (error) {
      renderError(error?.message || "Something went wrong loading products.");
    }
  };

  // ---- Image upload (within the form modal) ----

  const renderImageGrid = () => {
    const grid = document.getElementById("productImageGrid");
    if (!grid) return;
    grid.innerHTML = currentImages.map((img, idx) => `
      <div class="admin-image-tile">
        <img src="${img.url}" alt="" />
        <button type="button" class="admin-image-tile__remove" data-remove-image="${idx}" aria-label="Remove image">&times;</button>
      </div>
    `).join("");
    grid.querySelectorAll("[data-remove-image]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const idx = Number(btn.dataset.removeImage);
        const [removed] = currentImages.splice(idx, 1);
        renderImageGrid();
        // Best-effort cleanup on Cloudinary. If it fails, the image is
        // simply orphaned in storage - it's already detached from this
        // product's form state either way, so we don't block on it.
        if (removed?.publicId) {
          AdminUploadService.deleteImage(removed.publicId).catch((err) => {
            console.warn("[Products] Cloudinary cleanup failed for removed image:", err);
          });
        }
      });
    });
  };

  const handleFileSelection = async (fileList) => {
    const errorEl = document.getElementById("productImagesError");
    errorEl.classList.add("hidden");

    const files = Array.from(fileList);
    if (files.length === 0) return;

    if (currentImages.length + files.length > ADMIN_UPLOAD_LIMITS.maxFiles) {
      errorEl.textContent = `You can have at most ${ADMIN_UPLOAD_LIMITS.maxFiles} images per product.`;
      errorEl.classList.remove("hidden");
      return;
    }
    const invalidType = files.find((f) => !ADMIN_UPLOAD_LIMITS.allowedTypes.includes(f.type));
    if (invalidType) {
      errorEl.textContent = "Only JPEG, PNG, and WEBP images are allowed.";
      errorEl.classList.remove("hidden");
      return;
    }
    const tooLarge = files.find((f) => f.size > ADMIN_UPLOAD_LIMITS.maxFileSizeMB * 1024 * 1024);
    if (tooLarge) {
      errorEl.textContent = `Each image must be ${ADMIN_UPLOAD_LIMITS.maxFileSizeMB}MB or smaller.`;
      errorEl.classList.remove("hidden");
      return;
    }

    const grid = document.getElementById("productImageGrid");
    const placeholderCount = files.length;
    for (let i = 0; i < placeholderCount; i++) {
      const tile = document.createElement("div");
      tile.className = "admin-image-tile admin-image-tile--uploading";
      tile.innerHTML = `<div class="admin-spinner" style="width:18px;height:18px;border-width:2px;" role="status" aria-label="Uploading"></div>`;
      grid.appendChild(tile);
    }

    isUploading = true;
    try {
      const res = await AdminUploadService.uploadImages(files);
      currentImages = currentImages.concat(res?.data || []);
      renderImageGrid();
    } catch (error) {
      errorEl.textContent = error?.message || "Image upload failed. Please try again.";
      errorEl.classList.remove("hidden");
      renderImageGrid();
    } finally {
      isUploading = false;
    }
  };

  // ---- Create / Edit modal ----

  const populateCategorySelect = (selectedId) => {
    const select = document.getElementById("productCategoryInput");
    select.innerHTML = `<option value="">No category</option>` +
      categories.map((c) => `<option value="${c._id}" ${c._id === selectedId ? "selected" : ""}>${AdminFormat.escapeHtml(c.name)}</option>`).join("");
  };

  const clearFieldError = (input, errorEl) => {
    input.removeAttribute("aria-invalid");
    errorEl.classList.add("hidden");
  };
  const setFieldError = (input, errorEl, message) => {
    input.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  };

  const openFormModal = (product) => {
    editingProduct = product;
    currentImages = product?.images ? [...product.images] : [];

    const template = document.getElementById("productFormModalTemplate");
    document.body.appendChild(template.content.cloneNode(true));

    document.getElementById("productModalTitle").textContent = product ? "Edit Product" : "Add Product";
    document.getElementById("productSubmitText").textContent = product ? "Save Changes" : "Save Product";

    populateCategorySelect(product?.category?._id || product?.category);
    renderImageGrid();

    if (product) {
      document.getElementById("productNameInput").value = product.name || "";
      document.getElementById("productDescInput").value = product.description || "";
      document.getElementById("productSkuInput").value = product.sku || "";
      document.getElementById("productPriceInput").value = product.price ?? "";
      document.getElementById("productOldPriceInput").value = product.oldPrice ?? "";
      document.getElementById("productStockInput").value = product.stockQuantity ?? 0;
      document.getElementById("productStatusInput").value = product.status || "active";
      document.getElementById("productTagsInput").value = (product.tags || []).join(", ");
      document.getElementById("productFeaturedInput").checked = Boolean(product.isFeatured);
      document.getElementById("productBestSellerInput").checked = Boolean(product.isBestSeller);
      document.getElementById("productNewInput").checked = Boolean(product.isNew);
    }

    const backdrop = document.getElementById("productModalBackdrop");
    const close = () => backdrop.remove();
    document.getElementById("productModalCloseBtn").addEventListener("click", close);
    document.getElementById("productCancelBtn").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

    const dropzone = document.getElementById("productImageDropzone");
    const fileInput = document.getElementById("productImageInput");
    fileInput.addEventListener("change", (e) => handleFileSelection(e.target.files).then(() => { fileInput.value = ""; }));
    dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("admin-image-upload--dragover"); });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("admin-image-upload--dragover"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("admin-image-upload--dragover");
      handleFileSelection(e.dataTransfer.files);
    });

    const nameInput = document.getElementById("productNameInput");
    const nameError = document.getElementById("productNameError");
    const priceInput = document.getElementById("productPriceInput");
    const priceError = document.getElementById("productPriceError");
    const oldPriceInput = document.getElementById("productOldPriceInput");
    const oldPriceError = document.getElementById("productOldPriceError");
    const stockInput = document.getElementById("productStockInput");
    const stockError = document.getElementById("productStockError");

    const form = document.getElementById("productForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (isUploading) {
        showAdminToast("Please wait for image upload to finish.", "info");
        return;
      }

      let valid = true;
      const name = nameInput.value.trim();
      if (!name) { setFieldError(nameInput, nameError, "Product name is required"); valid = false; }
      else clearFieldError(nameInput, nameError);

      const price = Number(priceInput.value);
      if (!priceInput.value || Number.isNaN(price) || price <= 0) { setFieldError(priceInput, priceError, "Enter a valid price greater than 0"); valid = false; }
      else clearFieldError(priceInput, priceError);

      if (oldPriceInput.value !== "" && (Number.isNaN(Number(oldPriceInput.value)) || Number(oldPriceInput.value) < 0)) {
        setFieldError(oldPriceInput, oldPriceError, "Old price must be 0 or greater"); valid = false;
      } else clearFieldError(oldPriceInput, oldPriceError);

      if (stockInput.value !== "" && (!Number.isInteger(Number(stockInput.value)) || Number(stockInput.value) < 0)) {
        setFieldError(stockInput, stockError, "Stock must be a whole number, 0 or greater"); valid = false;
      } else clearFieldError(stockInput, stockError);

      if (!valid) return;

      const payload = {
        name,
        description: document.getElementById("productDescInput").value.trim(),
        category: document.getElementById("productCategoryInput").value || undefined,
        price,
        oldPrice: oldPriceInput.value !== "" ? Number(oldPriceInput.value) : undefined,
        stockQuantity: stockInput.value !== "" ? Number(stockInput.value) : 0,
        status: document.getElementById("productStatusInput").value,
        sku: document.getElementById("productSkuInput").value.trim() || undefined,
        tags: document.getElementById("productTagsInput").value.split(",").map((t) => t.trim()).filter(Boolean),
        images: currentImages,
        isFeatured: document.getElementById("productFeaturedInput").checked,
        isBestSeller: document.getElementById("productBestSellerInput").checked,
        isNew: document.getElementById("productNewInput").checked,
      };

      const submitBtn = document.getElementById("productSubmitBtn");
      const submitText = document.getElementById("productSubmitText");
      submitBtn.disabled = true;
      submitText.textContent = product ? "Saving…" : "Creating…";

      try {
        if (product) {
          await AdminProductService.update(product._id, payload);
          showAdminToast("Product updated.", "success");
        } else {
          await AdminProductService.create(payload);
          showAdminToast("Product created.", "success");
        }
        close();
        await loadProducts();
      } catch (error) {
        showAdminToast(error?.message || "Something went wrong. Please try again.", "error");
        submitBtn.disabled = false;
        submitText.textContent = product ? "Save Changes" : "Save Product";
      }
    });
  };

  // ---- Delete confirmation ----

  const openDeleteModal = (product) => {
    const template = document.getElementById("productDeleteModalTemplate");
    document.body.appendChild(template.content.cloneNode(true));

    const backdrop = document.getElementById("productDeleteBackdrop");
    const message = document.getElementById("productDeleteMessage");
    const confirmBtn = document.getElementById("productDeleteConfirmBtn");
    const confirmText = document.getElementById("productDeleteConfirmText");

    message.textContent = `This will permanently delete "${product.name}". This cannot be undone.`;

    const close = () => backdrop.remove();
    document.getElementById("productDeleteCancelBtn").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      confirmText.textContent = "Deleting…";
      try {
        await AdminProductService.remove(product._id);
        showAdminToast("Product deleted.", "success");
        close();
        await loadProducts();
      } catch (error) {
        // Backend blocks deleting an active product (409) and requires
        // deactivating it first - surface that exact guidance rather than
        // a generic failure message.
        message.textContent = error?.message || "Something went wrong. Please try again.";
        message.style.color = "var(--admin-danger)";
        confirmBtn.disabled = false;
        confirmText.textContent = "Delete";
      }
    });
  };

  (async () => {
    const user = await AdminLayout.guardAndRender("products");
    if (!user) return;

    const contentEl = document.getElementById("adminContent");
    const template = document.getElementById("productsTemplate");
    contentEl.appendChild(template.content.cloneNode(true));

    await loadCategoriesInto();

    document.getElementById("addProductBtn")?.addEventListener("click", () => openFormModal(null));
    document.getElementById("productSearchInput")?.addEventListener("input", debounce(() => { currentPage = 1; loadProducts(); }, 400));
    document.getElementById("productCategoryFilter")?.addEventListener("change", () => { currentPage = 1; loadProducts(); });
    document.getElementById("productStatusFilter")?.addEventListener("change", () => { currentPage = 1; loadProducts(); });

    await loadProducts();
  })();
})();
