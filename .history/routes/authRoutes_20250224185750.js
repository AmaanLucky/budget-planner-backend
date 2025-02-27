const express = require("express");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth"); 
const User = require("../models/User");

const router = express.Router();

// ✅ Verify Token and Return User Data
router.get("/verify", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;