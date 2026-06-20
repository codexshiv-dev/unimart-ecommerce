function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) {
        console.warn("Toast element not found in DOM!");
        return;
    }
    toast.textContent = msg;
    toast.style.display = "block"; // Make it visible
    
    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
};

// Ensure this line is present
console.log("✅ Toast utility loaded successfully");
window.showToast = showToast;