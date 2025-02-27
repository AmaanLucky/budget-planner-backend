const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    console.log("🔹 Incoming Headers:", req.headers); // ✅ Debugging headers

    const authHeader = req.header("Authorization");

    if (!authHeader) {
        console.error("❌ No Authorization header found");
        return res.status(401).json({ error: "Access denied, no token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.error("❌ Invalid token format");
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // ✅ Attach user info
        console.log("✅ Token Verified! User ID:", req.user.id);
        next();
    } catch (error) {
        console.error("❌ Invalid Token:", error.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};