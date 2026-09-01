(() => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const alertBox = document.getElementById("loginAlert");
  const submitBtn = document.getElementById("loginSubmitBtn");
  const submitText = document.getElementById("loginSubmitText");

  const setFieldError = (input, errorEl, message) => {
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.classList.add("hidden");
    }
  };

  const showAlert = (message) => {
    alertBox.textContent = message;
    alertBox.classList.remove("hidden");
  };
  const hideAlert = () => alertBox.classList.add("hidden");

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    submitText.textContent = isLoading ? "Signing in…" : "Sign in";
  };

  const validate = () => {
    let valid = true;
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      setFieldError(emailInput, emailError, "Email is required");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFieldError(emailInput, emailError, "Enter a valid email address");
      valid = false;
    } else {
      setFieldError(emailInput, emailError, "");
    }

    if (!password) {
      setFieldError(passwordInput, passwordError, "Password is required");
      valid = false;
    } else {
      setFieldError(passwordInput, passwordError, "");
    }

    return valid;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    if (!validate()) return;

    setLoading(true);
    try {
      const user = await AdminAuthState.login(emailInput.value.trim(), passwordInput.value);

      if (!user) {
        showAlert("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      if (user.role !== "admin") {
        // Real credentials, but not an admin account - log back out
        // immediately so no session is left half-authenticated on this
        // admin-only surface, then explain clearly.
        await AdminAuthState.logout();
        showAlert("This account does not have admin access.");
        setLoading(false);
        return;
      }

      window.location.href = AdminConfig.getPath("pages/dashboard.html");
    } catch (error) {
      showAlert(error?.message || "Invalid email or password.");
      setLoading(false);
    }
  });

  // If already logged in as an admin, skip straight to the dashboard
  // instead of showing the login form again.
  (async () => {
    const user = await AdminAuthState.init();
    if (user && user.role === "admin") {
      window.location.replace(AdminConfig.getPath("pages/dashboard.html"));
    }
  })();
})();
