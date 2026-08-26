const AuthService = {
  login: (email, password) =>
    ApiClient.post(UniMartConfig.getUrl("login"), { email, password }),

  register: (name, email, password, phone) =>
    ApiClient.post(UniMartConfig.getUrl("register"), { name, email, password, phone }),

  logout: () => ApiClient.post(UniMartConfig.getUrl("logout")),

  // Returns the current user, or null if not logged in - never throws for
  // the "not logged in" case, since that's an expected, normal state.
  getCurrentUser: async () => {
    try {
      const res = await ApiClient.get(UniMartConfig.getUrl("me"));
      return res?.user || null;
    } catch (error) {
      return null;
    }
  },
};

window.AuthService = AuthService;
