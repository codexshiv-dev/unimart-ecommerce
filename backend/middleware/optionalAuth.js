const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Like `protect`, but never rejects when no token is present - it just
// leaves req.user undefined and continues as a guest. Used on routes that
// must work identically for guests and logged-in users, like checkout.
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(); // no token - proceed as guest
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Invalid/expired token here isn't an error worth blocking on - just
    // proceed as a guest rather than rejecting the request.
  }

  next();
};

module.exports = optionalAuth;
