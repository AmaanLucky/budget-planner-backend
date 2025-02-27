const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    console.log("🔹 Incoming Headers:", req.headers);
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied, no token provided" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // ✅ Attach user info
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};