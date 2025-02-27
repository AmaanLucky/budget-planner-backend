const express = require('express');
const connectDB = require('./db');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// API Routes
app.use('/expenses', expenseRoutes);

app.listen(5000, () => console.log('Server running on port 5000 🚀'));
