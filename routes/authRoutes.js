import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/User.js";
import ResetToken from "../models/resetToken.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Try again later." },
});

router.get("/verify", auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "No user ID found in token" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Token Verification Failed" });
    }
    res.json(user);
  } 
  catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup",
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

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({ name, email, password: hashedPassword });
      await user.save();

      const payload = { user: { id: user.id, name: user.name } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } 
    catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.post("/login",loginLimiter,
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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Incorrect password for:", email);
        return res.status(400).json({ error: "Invalid credentials" });
      }

      req.rateLimit?.resetKey?.(req.ip);

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
  } 
  catch (error) {
    res.status(500).json({ error: "Error sending OTP" });
  }
});

router.post("/verify-otp", 
  [
    body("email").isEmail(), body("otp").isLength({ min: 6, max: 6 })
  ],
  async (req, res) => {
  const { email, otp } = req.body;

  try {
    const token = await ResetToken.findOne({ email });
    if (!token || token.otp !== otp || token.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    res.json({ message: "OTP verified successfully" });
  } 
  catch (error) {
    res.status(500).json({ error: "Error verifying OTP" });
  }
});

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
  } 
  catch (error) {
    res.status(500).json({ error: "Error resetting password" });
  }
});

export default router;