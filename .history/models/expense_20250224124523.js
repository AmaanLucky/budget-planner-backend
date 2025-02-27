const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Link to User
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: "Uncategorized" }, // ✅ Default category
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Expense", ExpenseSchema);
