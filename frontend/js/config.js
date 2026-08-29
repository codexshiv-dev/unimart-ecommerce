/**
 * UNiMART — Centralized environment/API configuration.
 * This is the ONLY file in the entire frontend allowed to contain a backend
 * URL. Every service builds requests through this file's getUrl(). Moving
 * hosting providers, changing domains, or adding a staging environment
 * should only ever require editing the two URLs below.
 */
const UniMartConfig = (() => {
  const IS_LOCAL_DEVELOPMENT =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const LOCAL_BACKEND_URL = "http://localhost:5000";
  const PRODUCTION_BACKEND_URL = "https://unimart-ecommerce.onrender.com";

  const API_BASE_URL = IS_LOCAL_DEVELOPMENT
    ? LOCAL_BACKEND_URL
    : PRODUCTION_BACKEND_URL;

  const endpoints = {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
    products: "/api/products",
    categories: "/api/categories",
    cart: "/api/cart",
    cartItem: "/api/cart/item",
    cartSync: "/api/cart/sync",
    checkout: "/api/checkout",
    orders: "/api/orders",
  };

  // Builds a full URL for a registered endpoint, optionally with a path
  // suffix (e.g. getUrl("products", "/64f...") -> ".../api/products/64f...")
  const getUrl = (name, suffix = "") => {
    const path = endpoints[name];
    if (!path) {
      throw new Error(`[Config] Unknown endpoint: "${name}"`);
    }
    return `${API_BASE_URL}${path}${suffix}`;
  };

  // ---- Frontend base path (for navigation, not the API) ----
  // Not guessed or hardcoded: derived from where THIS script (config.js)
  // actually resolved to. config.js always lives at "<frontendRoot>/js/config.js",
  // so its own resolved URL tells us exactly where the frontend root is -
  // whether that's the site root in production, or "/frontend/" locally
  // under Live Server, or any other deployment path. This is the same
  // reasoning as document.currentScript-based resolution used elsewhere in
  // this project, now consolidated into one place instead of being
  // re-derived separately per file.
  const FRONTEND_BASE_URL = (() => {
    const thisScript =
      document.currentScript ||
      document.querySelector('script[src*="config.js"]');
    if (!thisScript) return new URL("/", window.location.href).href;
    // config.js is at "<root>/js/config.js" - ".." from that goes up to "<root>/"
    return new URL("..", thisScript.src).href;
  })();

  // Builds an absolute URL for a frontend page/asset, e.g.
  // getPath("pages/cart.html") or getPath("product.html?id=123").
  const getPath = (relativePath = "") => new URL(relativePath, FRONTEND_BASE_URL).href;

  return Object.freeze({
    IS_LOCAL_DEVELOPMENT,
    API_BASE_URL,
    FRONTEND_BASE_URL,
    getUrl,
    getPath,
  });
})();

window.UniMartConfig = UniMartConfig;
