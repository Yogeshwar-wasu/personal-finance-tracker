const express = require("express");
const router = express.Router();
const { readJSON } = require("../utils/jsonDb");

router.get("/summary", (req, res) => {
  const tx = readJSON("transactions.json");
  const totalAmount = tx.reduce((s, t) => s + Number(t.amount), 0);
  const balance = tx.reduce((s, t) => s + Number(t.balance), 0);

  res.json({
    totalAmount,
    balance,
    totalExpense: totalAmount - balance
  });
});

router.get("/recent-transactions", (req, res) => {
  res.json(
    readJSON("transactions.json")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
  );
});

module.exports = router;
