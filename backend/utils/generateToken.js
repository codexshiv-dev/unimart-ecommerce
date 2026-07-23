const jwt = require("jsonwebtoken");

// Signs a JWT containing the user's id and role.
// Kept in one place so token shape and expiry stay consistent everywhere it's issued.
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
