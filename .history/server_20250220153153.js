const express = require('express');
const connectDB = require('./db'); // Import MongoDB connection function

const app = express();

// Connect to MongoDB
connectDB();

app.listen(5000, () => console.log('Server running on port 5000'));
