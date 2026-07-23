const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");

// @desc   Register a new customer account
// @route  POST /api/auth/register
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, phone });

    const token = generateToken(user._id, user.role);
    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      token, // also returned in the body for future React/mobile clients using Authorization headers
      user,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc   Log in an existing user
// @route  POST /api/auth/login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // Same generic message whether the email doesn't exist or the password is wrong.
    // This stops the login endpoint from being used to discover which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "This account has been deactivated" });
    }

    const token = generateToken(user._id, user.role);
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Log out the current user
// @route  POST /api/auth/logout
exports.logoutUser = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc   Get the currently logged-in user's profile
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
