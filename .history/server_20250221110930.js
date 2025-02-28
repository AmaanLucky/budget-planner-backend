const express = require("express");
const connectDB = require("./config/db"); // Database connection
const expenseRoutes = require("./routes/expenseRoutes"); // Import routes

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use Routes
app.use("/expenses", expenseRoutes); // Ensure this is present!

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
