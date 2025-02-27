const express = require("express");
const connectDB = require("./config/db"); // Database connection
const expenseRoutes = require("./routes/expenseRoutes"); // Import routes
const cors = require("cors");
require("dotenv").config();

const app = express(); // ✅ Initialize app before using middlewares

// Connect to MongoDB
connectDB();

// Middleware

app.use(express.json());
app.use(cors());
// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/expenses", require("./routes/expenseRoutes")); // ✅ Ensure this is correct

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} 🚀`));