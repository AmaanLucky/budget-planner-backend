const express = require("express");
const auth = require("../middleware/auth"); 
const User = require("../models/User");

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

module.exports = router;