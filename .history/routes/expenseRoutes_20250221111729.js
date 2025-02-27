const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// Add an Expense
router.post("/add", async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const newExpense = new Expense({ title, amount, category });
        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: "Failed to add expense" });
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

module.exports = router;
