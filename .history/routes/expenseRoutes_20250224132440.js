const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const auth = require("../middleware/auth"); // ✅ Ensure authentication

// ✅ Add an Expense (Only for Logged-in User)
router.post("/add", auth, async (req, res) => {
    try {
        const { title, amount, category } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ error: "Title and Amount are required" });
        }

        const newExpense = new Expense({
            user: req.user.id, // ✅ Link expense to user
            title,
            amount,
            category: category || "Uncategorized", // ✅ Default category
        });

        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error("❌ Error adding expense:", error);
        res.status(500).json({ error: "Failed to add expense" });
    }
});

// ✅ Get Expenses (Only for Logged-in User)
router.get("/", auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 }); // 🔹 Fetch only user-specific expenses, sorted by date
        res.status(200).json(expenses);
    } catch (error) {
        console.error("❌ Error fetching expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// ✅ Delete an Expense (Only if it belongs to the logged-in user)
router.delete("/:id", auth, async (req, res) => {
    try {
        const deletedExpense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id, // ✅ Ensure user can delete only their expenses
        });

        if (!deletedExpense) {
            return res.status(404).json({ error: "Expense not found or unauthorized" });
        }

        res.status(200).json({ message: "✅ Expense deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting expense:", error);
        res.status(500).json({ error: "Error deleting expense" });
    }
});

// ✅ Update an Expense (Only if it belongs to the logged-in user)
router.put("/:id", auth, async (req, res) => {
    try {
        const { title, amount, category } = req.body;

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, // ✅ Ensure user can update only their expenses
            { title, amount, category: category || "Uncategorized" },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ error: "Expense not found or unauthorized" });
        }

        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error("❌ Error updating expense:", error);
        res.status(500).json({ error: "Error updating expense" });
    }
});

module.exports = router;
