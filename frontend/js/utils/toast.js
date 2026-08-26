function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) {
        console.warn("Toast element not found in DOM!");
        return;
    }
    toast.textContent = msg;
    toast.classList.add("show"); // CSS visibility is opacity-based via .show, not display

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
};

window.showToast = showToast;
