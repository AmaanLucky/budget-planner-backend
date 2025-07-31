import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

process.on("uncaughtException", (err) => {
    console.error("🛑 Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Rejection:", reason);
});
