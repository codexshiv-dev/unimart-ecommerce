(() => {
  let categories = [];
  let editingCategory = null; // null = create mode
  let pendingDeleteCategory = null;

  const cardBody = () => document.getElementById("categoriesCardBody");

  // ---- List rendering ----

  const renderLoading = () => {
    cardBody().innerHTML = `
      <div class="admin-state">
        <div class="admin-spinner" role="status" aria-label="Loading"></div>
        <p class="admin-state__desc">Loading categories…</p>
      </div>
    `;
  };

  const renderError = (message) => {
    cardBody().innerHTML = `
      <div class="admin-state">
        <div class="admin-state__icon" aria-hidden="true">⚠</div>
        <div class="admin-state__title">Couldn't load categories</div>
        <div class="admin-state__desc">${AdminFormat.escapeHtml(message)}</div>
        <button class="admin-btn admin-btn--primary" id="categoriesRetryBtn" type="button">Try again</button>
      </div>
    `;
    document.getElementById("categoriesRetryBtn")?.addEventListener("click", loadCategories);
  };

  const renderEmpty = () => {
    cardBody().innerHTML = `
      <div class="admin-state">
        <div class="admin-state__icon" aria-hidden="true">\u2637</div>
        <div class="admin-state__title">No categories yet</div>
        <div class="admin-state__desc">Create your first category to start organizing products.</div>
        <button class="admin-btn admin-btn--primary" id="categoriesEmptyAddBtn" type="button">+ Add Category</button>
      </div>
    `;
    document.getElementById("categoriesEmptyAddBtn")?.addEventListener("click", () => openFormModal(null));
  };

  const renderTable = () => {
    const rows = categories.map((cat) => `
      <tr>
        <td class="admin-cell-primary admin-cell-truncate" title="${AdminFormat.escapeHtml(cat.name)}">${AdminFormat.escapeHtml(cat.name)}</td>
        <td class="admin-cell-muted">${AdminFormat.escapeHtml(cat.slug)}</td>
        <td class="admin-cell-muted">${AdminFormat.date(cat.createdAt)}</td>
        <td>
          <div class="admin-cell-actions">
            <button class="admin-btn admin-btn--secondary admin-btn--sm" data-edit="${cat._id}" type="button">Edit</button>
            <button class="admin-btn admin-btn--danger admin-btn--sm" data-delete="${cat._id}" type="button">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");

    cardBody().innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table admin-table--categories">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    cardBody().querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = categories.find((c) => c._id === btn.dataset.edit);
        if (cat) openFormModal(cat);
      });
    });
    cardBody().querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = categories.find((c) => c._id === btn.dataset.delete);
        if (cat) openDeleteModal(cat);
      });
    });
  };

  const loadCategories = async () => {
    renderLoading();
    try {
      const res = await AdminCategoryService.getAll();
      categories = res?.data || [];
      if (categories.length === 0) {
        renderEmpty();
      } else {
        renderTable();
      }
    } catch (error) {
      renderError(error?.message || "Something went wrong loading categories.");
    }
  };

  // ---- Create / Edit modal ----

  const openFormModal = (category) => {
    editingCategory = category;
    const template = document.getElementById("categoryFormModalTemplate");
    document.body.appendChild(template.content.cloneNode(true));

    const backdrop = document.getElementById("categoryModalBackdrop");
    const title = document.getElementById("categoryModalTitle");
    const nameInput = document.getElementById("categoryNameInput");
    const nameError = document.getElementById("categoryNameError");
    const form = document.getElementById("categoryForm");
    const submitBtn = document.getElementById("categorySubmitBtn");
    const submitText = document.getElementById("categorySubmitText");

    title.textContent = category ? "Edit Category" : "Add Category";
    submitText.textContent = category ? "Save Changes" : "Save Category";
    if (category) nameInput.value = category.name;

    const close = () => backdrop.remove();
    document.getElementById("categoryModalCloseBtn").addEventListener("click", close);
    document.getElementById("categoryCancelBtn").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", escHandler); }
    });

    nameInput.focus();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();

      if (!name) {
        nameInput.setAttribute("aria-invalid", "true");
        nameError.textContent = "Category name is required";
        nameError.classList.remove("hidden");
        return;
      }
      if (name.length > 60) {
        nameInput.setAttribute("aria-invalid", "true");
        nameError.textContent = "Category name is too long";
        nameError.classList.remove("hidden");
        return;
      }
      nameInput.removeAttribute("aria-invalid");
      nameError.classList.add("hidden");

      submitBtn.disabled = true;
      submitText.textContent = category ? "Saving…" : "Creating…";

      try {
        if (category) {
          await AdminCategoryService.update(category._id, name);
          showAdminToast("Category updated.", "success");
        } else {
          await AdminCategoryService.create(name);
          showAdminToast("Category created.", "success");
        }
        close();
        await loadCategories();
      } catch (error) {
        nameInput.setAttribute("aria-invalid", "true");
        nameError.textContent = error?.message || "Something went wrong. Please try again.";
        nameError.classList.remove("hidden");
        submitBtn.disabled = false;
        submitText.textContent = category ? "Save Changes" : "Save Category";
      }
    });
  };

  // ---- Delete confirmation modal ----

  const openDeleteModal = (category) => {
    pendingDeleteCategory = category;
    const template = document.getElementById("categoryDeleteModalTemplate");
    document.body.appendChild(template.content.cloneNode(true));

    const backdrop = document.getElementById("categoryDeleteBackdrop");
    const message = document.getElementById("categoryDeleteMessage");
    const confirmBtn = document.getElementById("categoryDeleteConfirmBtn");
    const confirmText = document.getElementById("categoryDeleteConfirmText");

    message.textContent = `This will permanently delete "${category.name}". This cannot be undone.`;

    const close = () => backdrop.remove();
    document.getElementById("categoryDeleteCancelBtn").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

    confirmBtn.addEventListener("click", async () => {
      confirmBtn.disabled = true;
      confirmText.textContent = "Deleting…";
      try {
        await AdminCategoryService.remove(category._id);
        showAdminToast("Category deleted.", "success");
        close();
        await loadCategories();
      } catch (error) {
        // Backend returns 409 with a specific "N products still assigned"
        // message when the category is in use - surface that exact message
        // rather than a generic failure, since it tells the admin exactly
        // what to do next (reassign or remove those products first).
        message.textContent = error?.message || "Something went wrong. Please try again.";
        message.style.color = "var(--admin-danger)";
        confirmBtn.disabled = false;
        confirmText.textContent = "Delete";
      }
    });
  };

  (async () => {
    const user = await AdminLayout.guardAndRender("categories");
    if (!user) return;

    const contentEl = document.getElementById("adminContent");
    const template = document.getElementById("categoriesTemplate");
    contentEl.appendChild(template.content.cloneNode(true));

    document.getElementById("addCategoryBtn")?.addEventListener("click", () => openFormModal(null));

    await loadCategories();
  })();
})();
