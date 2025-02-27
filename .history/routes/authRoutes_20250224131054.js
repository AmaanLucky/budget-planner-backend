const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth"); 

const router = express.Router();

// ⏩ Register a new user
router.post(
  "/signup",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // Validation Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      user = new User({ name, email, password: hashedPassword });
      await user.save();

      // Generate JWT token
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(201).json({ token });
    } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ⏩ Login User
router.post(
  "/login",
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
          // 🔹 Check if user exists
          let user = await User.findOne({ email });
          if (!user) {
              return res.status(400).json({ error: "Invalid credentials" });
          }

          // 🔹 Compare hashed password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return res.status(400).json({ error: "Invalid credentials" });
          }

          // 🔹 Generate JWT Token
          const payload = { user: { id: user.id } };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

          res.json({ token });
      } catch (error) {
          console.error("Login Error:", error);
          res.status(500).json({ error: "Server error" });
      }
  }
);
  
// Get All Users
router.get("/users", auth, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

module.exports = router;