const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // ✅ Import auth routes
const expenseRoutes = require("./routes/expenseRoutes"); // ✅ Import expense routes
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Routes
app.use("/auth", authRoutes); // 🔹 Ensure this line exists
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} 🚀`));

app.get("/", (req, res) => {
    res.send("API is running...");
});

console.log("🚀 Server is starting...");
console.log("🔄 Connecting to MongoDB...");
