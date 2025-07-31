import jwt from "jsonwebtoken";

export default function (req, res, next) {
    console.log("🔹 Incoming Headers:", req.headers);

    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ error: "Access denied, no token provided" });
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ error: "Invalid token format. Use 'Bearer <token>'" });
    }

    const token = tokenParts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } 
    catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};