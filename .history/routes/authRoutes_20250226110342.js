const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit"); // ✅ Rate Limiter for Login
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");
const resetToken = require("../models/resetToken"); // ✅ OTP Model
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Configure Nodemailer for OTP Emails
const transporter = nodemailer.createTransport({
  service: "gmail", // Change if using another provider
  auth: {
    user: process.env.EMAIL_USER, // Stored in .env
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Rate Limiter for Login Attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow 10 attempts per 15 minutes
  message: { error: "Too many login attempts. Try again later." },
});

// ✅ Verify Token and Return User Data
router.get("/verify", auth, async (req, res) => {
  try {
    console.log("🔹 Received Token:", req.header("Authorization"));

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
      const payload = { user: { id: user.id, name: user.name } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      console.log("✅ New user registered:", email);
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("❌ Signup Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ User Login with Rate Limiting
router.post(
  "/login",
  loginLimiter,
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
        console.log("❌ User not found:", email);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // 🔹 Compare Password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Incorrect password for:", email);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      req.rateLimit?.resetKey?.(req.ip);

      // 🔹 Generate JWT Token
      const payload = { user: { id: user.id, name: user.name } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

      console.log("✅ User logged in:", email);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("❌ Login Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Step 1: Request Password Reset (Send OTP)
router.post("/request-password-reset", [body("email").isEmail()], async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();

    await ResetToken.findOneAndUpdate(
      { email },
      { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
      { upsert: true }
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ error: "Error sending OTP" });
  }
});

// ✅ Step 2: Verify OTP
router.post("/verify-otp", [body("email").isEmail(), body("otp").isLength({ min: 6, max: 6 })], async (req, res) => {
  const { email, otp } = req.body;

  try {
    const token = await ResetToken.findOne({ email });
    if (!token || token.otp !== otp || token.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ error: "Error verifying OTP" });
  }
});

// ✅ Step 3: Reset Password
router.post("/reset-password", [body("email").isEmail(), body("newPassword").isLength({ min: 6 })], async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const token = await ResetToken.findOne({ email });
    if (!token) return res.status(400).json({ error: "OTP verification required" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    await ResetToken.deleteOne({ email });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
});

module.exports = router;
