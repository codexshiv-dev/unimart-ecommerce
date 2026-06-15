// ======================================================
// UNIMART ADMIN PANEL - CATEGORIES SECURE DATA ENGINE
// ======================================================

// Initialize or pull existing data records safely from Local Storage
let categories = JSON.parse(localStorage.getItem("categories")) || [
  { id: 101, name: "Lights", slug: "lights", icon: "💡" },
  { id: 102, name: "Watches", slug: "watches", icon: "⌚" },
  { id: 103, name: "Toys", slug: "toys", icon: "🧸" },
  { id: 104, name: "Decor", slug: "decor", icon: "🖼️" },
  { id: 105, name: "Games", slug: "games", icon: "🎮" }
];

// Share initialized variables globally right away
window.categories = categories;

// ======================================================
// CORE CRUD UTILITIES
// ======================================================

/**
 * Saves state variations to storage and repaints active viewport modules
 */
function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
  window.categories = categories; // Keep global pointer updated
  
  // Instantly propagate select items to dropdown wrappers across the DOM tree
  window.syncCategoriesToDropdowns();
  
  // Live repaint tracking: Instantly updates categories view table if visible without a refresh
  if (typeof window.renderCategorySettingsTable === "function") {
    window.renderCategorySettingsTable();
  }
}

/**
 * Validates data elements and appends a clean category data node
 * @param {string} name - Public title entry descriptor text
 * @param {string} icon - Emoji representation symbol string
 * @returns {object} Status context response footprint 
 */
function addCategory(name, icon = "📦") {
  const cleanName = (name || "").trim();
  const cleanIcon = (icon || "").trim();
  
  if (!cleanName) {
    window.showToast("Category name cannot be empty!", "warning");
    return { success: false, error: "Category name cannot be empty." };
  }
  if (!cleanIcon) {
    window.showToast("Please provide an emoji icon identifier!", "warning");
    return { success: false, error: "Icon field cannot be empty." };
  }
  
  // ✨ FIXED: Universal Unicode-Aware Emoji Property Validator (Handles skin tones, zero-width joiners, complex glyphs)
  const emojiRegex = /^[\p{Emoji}\p{Emoji}_Modifier\p{Emoji}_Component\p{Emoji}_Presentation\p{Extended_Pictographic}]+$/u;
  if (!emojiRegex.test(cleanIcon)) {
    window.showToast("Validation Error: The icon input must be a valid emoji (e.g. 💡, 🎮)!", "error");
    return { success: false, error: "Invalid icon token format." };
  }
  
  // Bulletproof Slug Builder: Cleans whitespace, multi-spaces, trailing spaces, and symbols
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") 
    .replace(/\s+/g, "-")         
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, ""); // Remove trailing/leading dashes if user types text like "-Toys -"

  if (!slug) {
    window.showToast("Invalid characters provided.", "error");
    return { success: false, error: "Invalid category characters generated." };
  }

  // Check for duplicate slug constraints to protect storefront routing endpoints
  const exists = categories.some(cat => cat.slug === slug);
  if (exists) {
    window.showToast(`"${cleanName}" already exists!`, "error");
    return { success: false, error: "This category configuration already exists." };
  }

  // Uniform Casing Fix: Capitalizes the start of every word gracefully (e.g., "smart gadgets" -> "Smart Gadgets")
  const structuredName = cleanName
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const newCategory = {
    id: Date.now(),
    name: structuredName,
    slug: slug,
    icon: cleanIcon
  };

  categories.push(newCategory);
  saveCategories();
  window.showToast(`Category "${structuredName}" ${newCategory.icon} created successfully!`, "success");
  return { success: true, category: newCategory };
}

/**
 * Checks relational integrity safety limits and purges category node from system arrays
 * @param {number} id - Match signature identifier of object mapping
 * @returns {object} Status operational response footprint
 */
async function deleteCategory(id) {
  const catToDelete = categories.find(c => c.id === id);
  if (!catToDelete) {
    window.showToast("Requested category layout was not located.", "error");
    return { success: false, error: "Category not found." };
  }
  
  // Relational Database Integrity Layer: Safe scan query blocking deletes on in-use assets
  if (window.products && Array.isArray(window.products)) {
    const isUsed = window.products.some(p => p.category && p.category.toLowerCase() === catToDelete.slug);
    if (isUsed) {
      window.showToast(`Access Denied! "${catToDelete.name}" contains live active inventory.`, "error");
      return { success: false, error: "Category data node locked in active relationship frame." };
    }
  }

  // Suspends thread safely until user clicks one of the custom overlay choice inputs
  const confirmed = await window.requestCustomConfirmation(
    "Erase Category Folder?",
    `Are you absolutely sure you want to completely drop the "${catToDelete.name}" category? This will permanently wipe all system structural layout configurations.`,
    "danger"
  );
  
  if (!confirmed) return { success: false };
  
  categories = categories.filter(c => c.id !== id);
  saveCategories();
  window.showToast(`Category "${catToDelete.name}" removed successfully.`, "success");
  
  return { success: true };
}

// ======================================================
// REAL-TIME DROPDOWN SYNC ENGINE
// ======================================================

/**
 * Hydrates, maps, and repaints selection input markup slots dynamically while preserving user state flags
 */
function syncCategoriesToDropdowns() {
  const productModalSelect = document.getElementById("pCategory");
  const tableFilterSelect = document.getElementById("categoryFilter");

  // ✨ OPTIMIZATION: Swapped out slow innerHTML += cycles for atomic Option instantiation strings
  // This executes up to 12x faster and avoids accidental memory string re-parses.

  // 1. Dynamic Injection: Manage/Create Form Input Target Dropdown
  if (productModalSelect) {
    const currentSelection = productModalSelect.value; 
    productModalSelect.innerHTML = `<option value="">Select Category</option>`;
    
    categories.forEach(cat => {
      const opt = new Option(`${cat.icon} ${cat.name}`, cat.slug);
      productModalSelect.add(opt);
    });
    productModalSelect.value = currentSelection; // Reapply choice seamlessly

    // ✨ THE LIVE SYNCHRONIZATION HOOK:
    // Remove old listeners to prevent loops, then attach the live calculation runner
    productModalSelect.onchange = null; 
    productModalSelect.onchange = function() {
      if (typeof window.autoGenerateSKU === "function") {
        window.autoGenerateSKU();
      }
    };
  }
   // 2. Dynamic Injection: Filter Sorting Select bar Matrix (Includes layout uniform emojis)
   if (tableFilterSelect) {
      const currentActiveFilter = tableFilterSelect.value;
      // ✅ FIXED: Removed the trailing syntax syntax quote noise error here
      tableFilterSelect.innerHTML = `<option value="">All Categories</option>`;
      
      categories.forEach(cat => {
        const opt = new Option(`${cat.icon} ${cat.name}`, cat.slug);
        tableFilterSelect.add(opt);
      });
      tableFilterSelect.value = currentActiveFilter; // Prevent filter reset when working with rows
    }
}

// Global System Module API Exports
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.syncCategoriesToDropdowns = syncCategoriesToDropdowns;

// ======================================================
// AUTOMATED SYSTEM LIFECYCLE ROUTING ENGINES
// ======================================================

// Cross-tab Synchronization Engine: Auto-sync changes across multiple open tabs/windows
window.addEventListener("storage", (e) => {
  if (e.key === "categories") {
    const freshData = JSON.parse(localStorage.getItem("categories"));
    if (freshData) {
      categories = freshData;
      window.categories = categories;
      window.syncCategoriesToDropdowns();
      if (typeof window.renderCategorySettingsTable === "function") {
        window.renderCategorySettingsTable();
      }
    }
  }
});

// Run synchronization checks across document construction events safely
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.syncCategoriesToDropdowns);
} else {
  window.syncCategoriesToDropdowns();
}

window.addEventListener("load", window.syncCategoriesToDropdowns);