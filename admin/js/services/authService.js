/**
 * UNiMART Admin — Auth service. Talks to the same /api/auth endpoints the
 * storefront uses (there is only one User model/one login endpoint - the
 * "admin" distinction is the user's role field, checked client-side for UX
 * only, and enforced for real by authorize("admin") on the backend).
 */
const AdminAuthService = {
  login: (email, password) =>
    AdminApiClient.post(AdminConfig.getUrl("login"), { email, password }),

  logout: () => AdminApiClient.post(AdminConfig.getUrl("logout")),

  // Returns the current user, or null if not logged in - never throws for
  // the "not logged in" case, since that's an expected, normal state on the
  // login page itself.
  getCurrentUser: async () => {
    try {
      const res = await AdminApiClient.get(AdminConfig.getUrl("me"));
      return res?.user || null;
    } catch (error) {
      if (error.status !== 401) {
        console.error("[AdminAuth] /me check failed unexpectedly:", { status: error.status, message: error.message, networkError: error.networkError || false });
      }
      return null;
    }
  },
};

window.AdminAuthService = AdminAuthService;
