const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "Uncategorized" }, // 🔹 Default category
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
