/**
 * UNiMART — API client. Every service (auth/product/category/cart/checkout)
 * calls through here instead of using fetch() directly. This is what
 * guarantees credentials:"include" (needed for the httpOnly auth cookie to
 * work cross-origin between Vercel and Render) is never forgotten on some
 * page and not others.
 */
const ApiClient = (() => {
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
      // Render's free tier, etc.) - normalize this the same shape as a
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
  };
})();

window.ApiClient = ApiClient;
