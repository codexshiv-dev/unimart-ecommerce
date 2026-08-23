const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { checkout } = require("../controllers/checkoutController");
const optionalAuth = require("../middleware/optionalAuth");

// Checkout is public (guest-accessible) and has real business impact per
// request (creates orders, decrements stock) - same rate-limiting
// discipline already applied to auth and upload endpoints.
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many checkout attempts, please slow down." },
});

router.post("/", checkoutLimiter, optionalAuth, checkout);

module.exports = router;
