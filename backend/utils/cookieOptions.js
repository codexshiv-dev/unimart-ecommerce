// Shared cookie settings, used both when setting the cookie (login/register)
// and when clearing it (logout) - the options must match exactly for
// res.clearCookie() to actually remove the cookie the browser is holding.
//
// Cross-origin note: the frontend (Vercel) and backend (Render) live on
// different domains, which makes every request "cross-site" to the browser.
// SameSite=Lax cookies are NOT sent on cross-site fetch/XHR calls, only on
// top-level navigation - so Lax would silently break login once deployed.
// SameSite=None (which requires Secure) is what actually works cross-site,
// so it's used only in production. Local development keeps Lax, since a
// local frontend and backend on localhost are same-site.
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the JWT expiry in generateToken.js
  path: "/",
};

module.exports = cookieOptions;
