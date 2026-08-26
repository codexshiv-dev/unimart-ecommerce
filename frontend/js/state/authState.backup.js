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

  const logout = async () => {
    await AuthService.logout();
    currentUser = null;
    notify();
  };

  // Components (like the header) can subscribe to be re-rendered whenever
  // auth state changes, instead of every page manually re-checking it.
  const onChange = (fn) => listeners.push(fn);

  return { init, isLoggedIn, getUser, login, logout, onChange, get initialized() { return initialized; } };
})();

window.AuthState = AuthState;
