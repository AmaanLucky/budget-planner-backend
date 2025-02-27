const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator"); // ✅ Fix here
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
// ✅ Verify Token and Return User Data
router.get("/verify", auth, async (req, res) => {
  try {
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

router.post(
  "/signup",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // User registration logic
  }
);

module.exports = router;