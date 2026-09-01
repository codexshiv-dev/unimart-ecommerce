/**
 * UNiMART Admin — Toast notifications. Every admin page includes a
 * <div id="toastContainer"> (see layout.js); toasts stack there and
 * auto-dismiss.
 */
function showAdminToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) {
    console.warn("[Toast] #toastContainer not found in DOM!");
    return;
  }

  const toast = document.createElement("div");
  toast.className = `admin-toast admin-toast--${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const icon = { success: "✓", error: "✕", info: "ℹ" }[type] || "ℹ";
  toast.innerHTML = `<span class="admin-toast__icon" aria-hidden="true">${icon}</span><span class="admin-toast__msg"></span>`;
  toast.querySelector(".admin-toast__msg").textContent = message;

  container.appendChild(toast);

  // Force reflow so the enter transition actually plays
  requestAnimationFrame(() => toast.classList.add("admin-toast--show"));

  const remove = () => {
    toast.classList.remove("admin-toast--show");
    setTimeout(() => toast.remove(), 200);
  };

  const timer = setTimeout(remove, duration);
  toast.addEventListener("click", () => {
    clearTimeout(timer);
    remove();
  });
}

window.showAdminToast = showAdminToast;
