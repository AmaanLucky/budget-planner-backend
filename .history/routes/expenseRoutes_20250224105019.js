const express = require("express");
const router = express.Router();
const Expense = require("../models/expense");
const auth = require("../middleware/auth");

// Add an Expense
router.post("/add", async (req, res) => {
    try {
        console.log("Incoming Request Body:", req.body); // Debugging

        const { title, amount, category } = req.body;

        if (!title || !amount) {  // 🔹 Removed required category validation
            console.log("❌ Missing fields:", { title, amount });
            return res.status(400).json({ error: "Title and Amount are required" });
        }

        const newExpense = new Expense({ title, amount, category: category || "Uncategorized" }); // 🔹 Default category
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        console.error("❌ Error adding expense:", error);
        res.status(500).json({ error: "Failed to add expense", details: error.message });
    }
});

// Get All Expenses
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// Delete an Expense
router.delete("/:id", async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting expense", error });
    }
});

// Update an Expense
router.put("/:id", async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { title, amount, category: category || "Uncategorized" }, // 🔹 Default category
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: "Error updating expense", error });
    }
});
router.post("/add", auth, async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const newExpense = new Expense({ user: req.user.id, title, amount, category });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: "Failed to add expense" });
    }
});

// ⏩ Get Expenses (Only for Logged-in User)
router.get("/", auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

module.exports = router;