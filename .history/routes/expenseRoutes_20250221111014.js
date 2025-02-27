const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense"); // Import Expense model

// @route   POST /expenses/add
// @desc    Add a new expense
router.post("/add", async (req, res) => {
    try {
        const { title, amount, category } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({
            title,
            amount,
            category
        });

        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;
