const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit"); // ✅ Import Rate Limiter
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Rate Limiter for Login Attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 attempts per 15 minutes
  message: { error: "Too many login attempts. Try again later." },
});

// ✅ Verify Token and Return User Data
router.get("/verify", auth, async (req, res) => {
  try {
    console.log("🔹 Received Token:", req.header("Authorization")); // Debugging

    if (!req.user?.id) {
      return res.status(401).json({ error: "No user ID found in token" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.error("❌ Token verification failed: User not found");
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("✅ Token verified successfully for:", user.email);
    res.json(user);
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ User Signup
router.post(
  "/signup",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      // 🔹 Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 🔹 Create New User
      user = new User({ name, email, password: hashedPassword });
      await user.save();

      // 🔹 Generate JWT Token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      console.log("✅ New user registered:", email);
      res.status(201).json({ token });
    } catch (error) {
      console.error("❌ Signup Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ User Login with Rate Limiting
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit"); // ✅ Import Rate Limiter
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Rate Limiter for Login Attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 attempts per 15 minutes
  message: { error: "Too many login attempts. Try again later." },
});

// ✅ Verify Token and Return User Data
router.get("/verify", auth, async (req, res) => {
  try {
    console.log("🔹 Received Token:", req.header("Authorization")); // Debugging

    if (!req.user?.id) {
      return res.status(401).json({ error: "No user ID found in token" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.error("❌ Token verification failed: User not found");
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("✅ Token verified successfully for:", user.email);
    res.json(user);
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ User Signup
router.post(
  "/signup",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      // 🔹 Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 🔹 Create New User
      user = new User({ name, email, password: hashedPassword });
      await user.save();

      // 🔹 Generate JWT Token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      console.log("✅ New user registered:", email);
      res.status(201).json({ token });
    } catch (error) {
      console.error("❌ Signup Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ User Login with Rate Limiting
router.post(
  "/login",
  loginLimiter, // 🔹 Apply Rate Limiter Here
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // 🔹 Compare Password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // 🔹 Generate JWT Token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      console.log("✅ User logged in:", email);
      res.json({ token });
    } catch (error) {
      console.error("❌ Login Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;

module.exports = router;
