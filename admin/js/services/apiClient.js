/**
 * UNiMART Admin — API client. Every service calls through here instead of
 * using fetch() directly, so credentials:"include" (needed for the httpOnly
 * auth cookie to work cross-origin) is never forgotten on some page and not
 * others, and every failure shape is normalized the same way.
 */
const AdminApiClient = (() => {
  const request = async (url, options = {}) => {
    let response;
    try {
      response = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      });
    } catch (networkError) {
      // Backend unreachable (offline, CORS misconfig, cold-start timeout on
      // Render's free tier, etc.) - normalized to the same shape as a
      // regular error response so callers only need one error path.
      throw { success: false, message: "Could not reach the server. Please check your connection.", networkError: true };
    }

    let body = null;
    try {
      body = await response.json();
    } catch (parseError) {
      // No JSON body (e.g. a 204, or an unexpected non-JSON error page)
    }

    if (!response.ok) {
      // A 401 mid-session only means "session expired" if we previously
      // believed we were logged in. The initial GET /api/auth/me on page
      // load never reaches this branch while logged out, since AdminAuthState
      // hasn't set a user yet - so this can't misfire on first load.
      if (response.status === 401 && window.AdminAuthState?.isLoggedIn()) {
        window.AdminAuthState.handleSessionExpired();
      }
      throw { success: false, message: body?.message || `Request failed (${response.status})`, status: response.status, body };
    }

    return body;
  };

  // multipart requests (image upload) must NOT set Content-Type themselves -
  // the browser needs to set it with the correct multipart boundary.
  const requestMultipart = async (url, formData, options = {}) => {
    let response;
    try {
      response = await fetch(url, {
        credentials: "include",
        ...options,
        body: formData,
      });
    } catch (networkError) {
      throw { success: false, message: "Could not reach the server. Please check your connection.", networkError: true };
    }

    let body = null;
    try {
      body = await response.json();
    } catch (parseError) {
      // no JSON body
    }

    if (!response.ok) {
      if (response.status === 401 && window.AdminAuthState?.isLoggedIn()) {
        window.AdminAuthState.handleSessionExpired();
      }
      throw { success: false, message: body?.message || `Request failed (${response.status})`, status: response.status, body };
    }

    return body;
  };

  return {
    get: (url) => request(url, { method: "GET" }),
    post: (url, data) => request(url, { method: "POST", body: JSON.stringify(data) }),
    put: (url, data) => request(url, { method: "PUT", body: JSON.stringify(data) }),
    patch: (url, data) => request(url, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (url, data) => request(url, { method: "DELETE", body: data ? JSON.stringify(data) : undefined }),
    postMultipart: (url, formData) => requestMultipart(url, formData, { method: "POST" }),
  };
})();

window.AdminApiClient = AdminApiClient;
