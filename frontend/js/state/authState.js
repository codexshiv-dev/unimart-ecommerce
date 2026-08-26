/**
 * UNiMART — Auth state. One in-memory source of truth for "who is logged
 * in right now", populated once per page load from GET /api/auth/me (the
 * httpOnly cookie itself is the real session - this just mirrors it into
 * something the UI can read synchronously after init()).
 */
const AuthState = (() => {
  let currentUser = null;
  let initialized = false;
  const listeners = [];

  const notify = () => listeners.forEach((fn) => fn(currentUser));

  const init = async () => {
    currentUser = await AuthService.getCurrentUser();
    initialized = true;
    notify();
    return currentUser;
  };

  const isLoggedIn = () => Boolean(currentUser);
  const getUser = () => currentUser;

  const login = async (email, password) => {
    const res = await AuthService.login(email, password);
    currentUser = res?.user || null;
    notify();
    return currentUser;
  };

  const register = async (name, email, password, phone) => {
    const res = await AuthService.register(name, email, password, phone);
    currentUser = res?.user || null; // register already sets the auth cookie server-side, same as login
    notify();
    return currentUser;
  };

  const logout = async () => {
    await AuthService.logout();
    currentUser = null;
    notify();
  };

  // Called by apiClient.js when a request that expected to be authenticated
  // comes back 401 mid-session (cookie expired/invalidated after we already
  // believed we were logged in). The `!currentUser` guard both skips the
  // normal logged-out case AND naturally prevents this from firing twice if
  // multiple in-flight requests 401 around the same time - the first call
  // resets currentUser to null, so any subsequent call becomes a no-op.
  const handleSessionExpired = () => {
    if (!currentUser) return;
    currentUser = null;
    notify();
    window.showToast?.("Your session has expired. Please log in again.");
  };

  // Components (like the header) can subscribe to be re-rendered whenever
  // auth state changes, instead of every page manually re-checking it.
  const onChange = (fn) => listeners.push(fn);

  return { init, isLoggedIn, getUser, login, register, logout, handleSessionExpired, onChange, get initialized() { return initialized; } };
})();

window.AuthState = AuthState;
