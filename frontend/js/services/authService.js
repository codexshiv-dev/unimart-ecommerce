const AuthService = {
  login: (email, password) =>
    ApiClient.post(UniMartConfig.getUrl("login"), { email, password }),

  register: (name, email, password, phone) =>
    ApiClient.post(UniMartConfig.getUrl("register"), { name, email, password, phone }),

  logout: () => ApiClient.post(UniMartConfig.getUrl("logout")),

  // Returns the current user, or null if not logged in - never throws for
  // the "not logged in" case, since that's an expected, normal state.
  // A 401 here stays completely silent (that's the guest case working as
  // designed). Anything else (network unreachable, 429, 500) is logged to
  // console for diagnosability, while still returning null either way -
  // no behavior change, just visibility into genuine failures.
  getCurrentUser: async () => {
    try {
      const res = await ApiClient.get(UniMartConfig.getUrl("me"));
      return res?.user || null;
    } catch (error) {
      if (error.status !== 401) {
        console.error("[Auth] /me check failed unexpectedly:", { status: error.status, message: error.message, networkError: error.networkError || false });
      }
      return null;
    }
  },
};

window.AuthService = AuthService;
