const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token

    if (!token) {
        return res.status(401).json({ error: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};