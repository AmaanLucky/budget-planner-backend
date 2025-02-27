const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    console.log("🔹 Incoming Headers:", req.headers); // ✅ Debugging headers

    const authHeader = req.header("Authorization");

    if (!authHeader) {
        console.error("❌ No Authorization header found");
        return res.status(401).json({ error: "Access denied, no token provided" });
    }

    // ✅ Ensure token format is correct
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        console.error("❌ Invalid token format:", authHeader);
        return res.status(401).json({ error: "Invalid token format. Use 'Bearer <token>'" });
    }

    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // ✅ Attach user info
        console.log("✅ Token Verified! User ID:", req.user.id);
        next();
    } catch (error) {
        console.error("❌ Invalid Token:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};