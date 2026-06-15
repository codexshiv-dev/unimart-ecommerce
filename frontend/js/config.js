/**
 * ==========================================================================
 * 🌐 UNIMART ARCHITECTURE CONFIGURATION ENGINE (ENTERPRISE PRODUCTION)
 * ==========================================================================
 */
const UniMartConfig = {
    // 🎛️ AUTOMATED ENVIRONMENT DETECTOR (No flags to manually change anymore!)
    IS_LOCAL_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // 🚀 HOUSING PROVIDER TARGETS
    PRODUCTION_BACKEND_URL: "https://unimart-ecommerce.onrender.com", 
    LOCAL_BACKEND_URL: "http://localhost:5000",

    // ⚙️ ENDPOINT REGISTRY MATRIX
    endpoints: {
        products: "/api/products",
        orders: "/api/orders",
        customers: "/api/customers",
        categories: "/api/categories"
    },

    /**
     * Resolves absolute network gateways cleanly 
     * @param {string} name - Registered endpoint pointer
     * @returns {string} Fully qualified URI string
     */
    getEndpoint(name) {
        const base = this.IS_LOCAL_DEVELOPMENT ? this.LOCAL_BACKEND_URL : this.PRODUCTION_BACKEND_URL;
        if (!this.endpoints[name]) {
            console.error(`[Config Error] Endpoint target "${name}" does not exist.`);
            return "";
        }
        return `${base}${this.endpoints[name]}`;
    }
};

// Freeze object state context to lock resource manipulation vectors at runtime
Object.freeze(UniMartConfig);

// Attach cleanly to global scope so all your HTML pages can see it seamlessly
window.UniMartConfig = UniMartConfig;