const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ Access Denied: No valid token provided");
        return res.status(401).json({ error: "Access denied, no valid token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded.user;
        console.log("✅ Token verified successfully for user:", req.user.id);
        next();
    } catch (error) {
        console.error("❌ Invalid token:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
