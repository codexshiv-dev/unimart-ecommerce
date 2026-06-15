// ========================================================
// GLOBAL MODAL ACTION CONTROLLERS
// ========================================================

function openModal(isEditMode = false) {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  // ✨ FIX: Only reset the form when creating a NEW product to preserve pre-filled edit data
  if (!isEditMode) {
    resetProductForm();
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function resetProductForm() {
  const form = document.getElementById("productForm");
  form?.reset();

  const id = document.getElementById("productId");
  if (id) id.value = "";

  const title = document.getElementById("modalTitle");
  if (title) title.textContent = "Add New Product";

  // Force reset dynamic badges defaults explicitly
  if (document.getElementById("pIsFeatured")) document.getElementById("pIsFeatured").checked = false;
  if (document.getElementById("pIsNew")) document.getElementById("pIsNew").checked = true; 
  if (document.getElementById("pIsBestSeller")) document.getElementById("pIsBestSeller").checked = false;

  // Clear shared asset state arrays safely
  if (typeof window.resetImageGallery === "function") window.resetImageGallery();
  if (typeof window.resetRunningTags === "function") window.resetRunningTags();

  // Clear binary cache buffers to prevent image leakage from prior creations
  window.uploadedImagesBase64 = [];

  // Draw initial empty states cleanly without duplicating layout listeners
  const thumbGrid = document.getElementById("thumbnailStripGrid");
  if (thumbGrid) thumbGrid.innerHTML = "";
  
  const pillsContainer = document.getElementById("tagsPillsContainer");
  if (pillsContainer) pillsContainer.innerHTML = "";
}

// ========================================================
// ASYNCHRONOUS HTML FRAGMENT INJECTOR ENGINE
// ========================================================

async function loadProductModal() {
  const container = document.getElementById("product-modal-container");
  if (!container) return;

  try {
    const response = await fetch("../components/product-modal.html");
    if (!response.ok) throw new Error("Product modal structural asset missing.");

    container.innerHTML = await response.text();
    initProductModal();
  } catch (error) {
    console.error("❌ Component Mount Core Error:", error);
  }
}

// ========================================================
// COMPONENT INTERACTION HOOKS & EVENT HANDLERS
// ========================================================

// Named handlers to prevent duplicate binding memory leaks
function handleBackdropClick(e) {
  const modal = document.getElementById("productModal");
  if (e.target === modal) closeModal();
}

function handleEscapeKey(e) {
  const modal = document.getElementById("productModal");
  if (e.key === "Escape" && modal?.classList.contains("active")) {
    closeModal();
  }
}

function initProductModal() {
  const modal = document.getElementById("productModal");
  const closeBtn = document.getElementById("closeFormBtn");
  const cancelBtn = document.getElementById("cancelFormBtn");
  const openBtn = document.getElementById("addProductBtn");

  if (!modal) return;

  // 1. Safe Page Open Action Binding
  if (openBtn) {
    openBtn.onclick = () => openModal(false); // Clean explicit mapping assignment
  }

  // 2. Clear and assign uniform close element triggers safely
  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;

  // 3. Clear existing listeners using explicit references before re-attaching
  modal.removeEventListener("click", handleBackdropClick);
  modal.addEventListener("click", handleBackdropClick);

  document.removeEventListener("keydown", handleEscapeKey);
  document.addEventListener("keydown", handleEscapeKey);

  // 4. Wake up downstream validation form systems
  if (typeof window.bindProductFormSubmit === "function") {
    window.bindProductFormSubmit();
  }

  // 5. Hydrate selection drops matching localized structural profiles
  if (typeof window.syncCategoriesToDropdowns === "function") {
    window.syncCategoriesToDropdowns();
  }

  // 6. Mount auxiliary extension subsystems
  if (typeof window.initializePremiumGalleryEngine === "function") {
    window.initializePremiumGalleryEngine();
  }
  if (typeof window.initializePremiumTagsEngine === "function") {
    window.initializePremiumTagsEngine();
  }
}

// ========================================================
// CROSS-MODULE CATEGORY LISTENER MANAGEMENT
// ========================================================

function injectGlobalCategoryStateListeners() {
  // Sync structural options across separate active browser window tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'categories' && typeof window.syncCategoriesToDropdowns === 'function') {
      window.syncCategoriesToDropdowns();
    }
  });

  // Re-verify dropdown choice structures instantly when processing custom additions
  const openModalButton = document.getElementById("addProductBtn");
  if (openModalButton) {
    openModalButton.addEventListener("click", () => {
      if (typeof window.syncCategoriesToDropdowns === 'function') {
        window.syncCategoriesToDropdowns();
      }
    });
  }

  // Optimize MutationObserver targeting by constraining scope to container boundaries instead of body
  const modalTarget = document.getElementById("product-modal-container");
  if (modalTarget) {
    const observer = new MutationObserver((mutations) => {
      let shouldSync = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.id === 'pCategory' || (node.querySelector && node.querySelector('#pCategory'))) {
            shouldSync = true;
          }
        });
      });
      
      if (shouldSync && typeof window.syncCategoriesToDropdowns === 'function') {
        window.syncCategoriesToDropdowns();
        observer.disconnect(); // Disconnect once elements locate to preserve CPU processing profiles
      }
    });

    observer.observe(modalTarget, {
      childList: true,
      subtree: true
    });
  }
}

// Global System Scope Registration Hooks
window.openModal = openModal;
window.closeModal = closeModal;
window.resetProductForm = resetProductForm;

// Safe lifecycle bootstrap initialization orchestrator
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", loadProductModal);
  document.addEventListener('DOMContentLoaded', injectGlobalCategoryStateListeners);
} else {
  loadProductModal();
  injectGlobalCategoryStateListeners();
}