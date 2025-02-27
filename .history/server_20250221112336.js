const express = require("express");
const connectDB = require("./config/db"); // Database connection
const expenseRoutes = require("./routes/expenseRoutes"); // Import routes

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());


// Use Routes
app.use("/expenses", expenseRoutes); // Ensure this is present!

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
