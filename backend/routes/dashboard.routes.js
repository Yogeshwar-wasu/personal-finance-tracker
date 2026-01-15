const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

/* ================= DASHBOARD SUMMARY ================= */
router.get("/summary", async (req, res) => {
    try {
        const query = `
             SELECT
        IFNULL(SUM(amount), 0) AS totalAmount,
        IFNULL(SUM(balance), 0) AS balance
      FROM transactions
        `;

        const [result] = await executeQuery(query);
        const totalExpense = result.totalAmount - result.balance;

        res.json({
            totalAmount: result.totalAmount,
            balance: result.balance,
            totalExpense: totalExpense
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ================= RECENT TRANSACTIONS ================= */
router.get("/recent-transactions", async (req, res) => {
    try {
        const query = `
             SELECT
        id,
        description,
        amount,
        balance,
        date,
        status
      FROM transactions
      ORDER BY date DESC, id DESC
      LIMIT 10
        `;

        const result = await executeQuery(query);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
