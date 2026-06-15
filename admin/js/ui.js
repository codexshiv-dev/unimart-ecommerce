// ========================================================
// ⚡ UNIMART ADMIN CORE ASYNCHRONOUS COMPONENT LOADER
// ========================================================
async function loadComponent(containerId, filePath) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Asset not found: ${filePath}`);
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error(`❌ Component Loader Error [${containerId}]:`, error);
  }
}

// Optimized sequencing: Load non-dependent assets in parallel for faster parsing speed
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([
      loadComponent("sidebar-container", "../components/sidebar.html"),
      loadComponent("header-container", "../components/header.html"),
      loadComponent("shared-ui-layer-container", "../components/shared-ui.html")
    ]);
  } catch (err) {
    console.error("❌ Critical error encountered bootstrapping common layout components:", err);
  }
});

// ========================================================
// ⚡ GLOBAL SYSTEM TOAST ENGINE
// ========================================================
window.showToast = function(message, type = "success") {
  let container = document.getElementById("global-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "global-toast-container";
    container.className = "toast-notification-container";
    document.body.appendChild(container);
  }

  // ✨ OPTIMIZATION: Normalize "danger" variants to map perfectly to error channels
  let normalizedType = type;
  if (type === "danger") normalizedType = "error";

  let icon = "ℹ️";
  if (normalizedType === "success") icon = "✅";
  if (normalizedType === "error")   icon = "❌";
  if (normalizedType === "warning") icon = "⚠️";

  const toastCard = document.createElement("div");
  toastCard.className = `toast-message-card toast-${normalizedType}`;
  toastCard.innerHTML = `
    <div class="toast-icon-wrapper">${icon}</div>
    <div class="toast-body-text">${message}</div>
  `;

  container.appendChild(toastCard);

  // Use requestAnimationFrame for smoother hardware-accelerated mobile animations
  requestAnimationFrame(() => {
    setTimeout(() => { toastCard.classList.add("reveal-toast"); }, 10);
  });

  setTimeout(() => {
    toastCard.classList.remove("reveal-toast");
    setTimeout(() => { toastCard.remove(); }, 400);
  }, 3500);
};

// ========================================================
// 💎 GLOBAL REUSABLE PROMISE-BASED CONFIRMATION CONTROLLER
// ========================================================
window.requestCustomConfirmation = function(title, description, styleType = "danger") {
  return new Promise((resolve) => {
    const modal = document.getElementById("customConfirmModal");
    const titleEl = document.getElementById("confirmModalTitle");
    const descEl = document.getElementById("confirmModalDescription");
    const iconEl = document.getElementById("confirmModalIcon");
    const cancelBtn = document.getElementById("confirmCancelBtn");
    const proceedBtn = document.getElementById("confirmProceedBtn");

    // Fallback if the structural elements are missing from the DOM
    if (!modal || !cancelBtn || !proceedBtn) {
      console.warn("⚠️ Custom confirmation modal HTML blocks were not found. Falling back to native alert.");
      resolve(confirm(`${title}\n\n${description}`));
      return;
    }

    // 1. Hydrate the text nodes instantly
    titleEl.textContent = title;
    descEl.textContent = description;
    
    if (iconEl) {
      iconEl.textContent = (styleType === "danger" || styleType === "error") ? "🗑️" : "⚠️";
    }

    // 2. FORCE MAXIMUM VISIBILITY INLINE STYLES IMMEDIATELY
    modal.style.setProperty("display", "flex", "important");
    modal.style.setProperty("opacity", "1", "important");
    modal.style.setProperty("pointer-events", "all", "important");
    
    // Smoothly apply the CSS animation class hook
    modal.classList.add("show-confirm");

    // 3. Define the click resolver
    const closeAndResolve = (userChoice) => {
      // Hide layout properties safely
      modal.classList.remove("show-confirm");
      modal.style.display = "none";
      modal.style.opacity = "0";
      modal.style.pointerEvents = "none";
      
      // Clean up event listeners to prevent cumulative stack memory leak loops
      cancelBtn.removeEventListener("click", handleCancelClick);
      proceedBtn.removeEventListener("click", handleProceedClick);
      
      // Return true or false to the awaiting function execution stack
      resolve(userChoice);
    };

    function handleCancelClick(e) {
      e.preventDefault();
      e.stopPropagation();
      closeAndResolve(false);
    }

    function handleProceedClick(e) {
      e.preventDefault();
      e.stopPropagation();
      closeAndResolve(true);
    }

    // 4. Attach clear click event triggers
    cancelBtn.addEventListener("click", handleCancelClick);
    proceedBtn.addEventListener("click", handleProceedClick);
  });
};