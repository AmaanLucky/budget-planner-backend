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

router.delete('/:id', async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error });
    }
});

// Update an Expense
router.put('/:id', async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { title, amount, category },
            { new: true } // Return updated document
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error });
    }
});

module.exports = router;
