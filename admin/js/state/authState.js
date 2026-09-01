/**
 * UNiMART Admin — Auth state. One in-memory source of truth for "who is
 * logged in right now", populated from GET /api/auth/me (the httpOnly
 * cookie is the real session - this just mirrors it for the UI).
 *
 * IMPORTANT: isAdmin() is a UX convenience only. It decides whether the
 * admin UI shows itself or bounces to login - it is NOT the security
 * boundary. Every admin write endpoint is independently protected by the
 * backend's protect + authorize("admin") middleware, which is what
 * actually stops a non-admin from mutating data even if this check were
 * bypassed entirely.
 */
const AdminAuthState = (() => {
  let currentUser = null;
  let initialized = false;
  let initPromise = null;
  let lastAuthenticatedAt = 0;

  const init = () => {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      currentUser = await AdminAuthService.getCurrentUser();
      initialized = true;
      return currentUser;
    })();
    return initPromise;
  };

  const isLoggedIn = () => Boolean(currentUser);
  const isAdmin = () => Boolean(currentUser && currentUser.role === "admin");
  const getUser = () => currentUser;

  const login = async (email, password) => {
    const res = await AdminAuthService.login(email, password);
    currentUser = res?.user || null;
    lastAuthenticatedAt = Date.now();
    return currentUser;
  };

  const logout = async () => {
    try {
      await AdminAuthService.logout();
    } finally {
      currentUser = null;
    }
  };

  // Called by apiClient.js when a request that expected to be authenticated
  // comes back 401 mid-session (cookie expired/invalidated). Redirects back
  // to login rather than leaving the admin stuck on a broken page.
  const handleSessionExpired = () => {
    if (!currentUser) return;

    // A 401 within a few seconds of a successful login is far more likely
    // to be a transient cookie-delivery issue than a genuine expiry.
    if (Date.now() - lastAuthenticatedAt < 5000) {
      console.warn("[AdminAuthState] Ignoring 401 shortly after login - treating as transient.");
      return;
    }

    currentUser = null;
    window.showAdminToast?.("Your session has expired. Please log in again.", "error");
    setTimeout(() => {
      window.location.href = AdminConfig.getPath("pages/login.html");
    }, 1200);
  };

  return {
    init,
    isLoggedIn,
    isAdmin,
    getUser,
    login,
    logout,
    handleSessionExpired,
    get initialized() { return initialized; },
  };
})();

window.AdminAuthState = AdminAuthState;
