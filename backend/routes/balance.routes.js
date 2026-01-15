const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

router.post("/save", async (req, res) => {
  try {
    const rows = req.body.rows;

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "No rows received" });
    }

    const transactionId = rows[0].transactionId;

    await executeQuery(
      "DELETE FROM balance_entries WHERE transaction_id = ?",
      [transactionId]
    );

    for (let row of rows) {
      if (!row.name || !row.amount) continue;

      const dateValue = row.date ? new Date(row.date) : null;

      await executeQuery(
        `INSERT INTO balance_entries (transaction_id, name, amount, date)
         VALUES (?, ?, ?, ?)`,
        [transactionId, row.name, row.amount, dateValue]
      );
    }

    const totalSpentData = await executeQuery(
      "SELECT SUM(amount) AS totalSpent FROM balance_entries WHERE transaction_id = ?",
      [transactionId]
    );

    const totalSpent = Number(totalSpentData[0].totalSpent || 0);

    const trx = await executeQuery(
      "SELECT amount FROM transactions WHERE id = ?",
      [transactionId]
    );

    const totalAmount = Number(trx[0].amount || 0);
    const newBalance = totalAmount - totalSpent;

    let status = "NOT_USED";

    if (totalSpent > 0 && newBalance > 0) {
      status = "PARTIAL_USED";
    } else if (newBalance <= 0) {
      status = "FULL_USED";
    }

    await executeQuery(
      "UPDATE transactions SET balance = ?, usedAmount = ?, status = ?  WHERE id = ?",
      [newBalance, totalSpent,status, transactionId]
    );

    res.json({ message: "Saved successfully", newBalance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed", details: err });
  }
});

router.get("/all/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const rows = await executeQuery(
      `SELECT id, transaction_id, name, amount, 
          DATE_FORMAT(date, '%Y-%m-%d') AS date, 
          created_on
   FROM balance_entries
   WHERE transaction_id = ?`,
      [transactionId]
    );

    const trx = await executeQuery(
      "SELECT amount AS totalAmount, balance AS previousBalance FROM transactions WHERE id = ?",
      [transactionId]
    );

    if (trx.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      list: rows,
      totalAmount: Number(trx[0].totalAmount),
      previousBalance: Number(trx[0].previousBalance)
    });

  } catch (err) {
    res.status(500).json({ error: "Database Error", details: err });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const rowId = req.params.id;

    const rowData = await executeQuery(
      "SELECT transaction_id FROM balance_entries WHERE id = ?",
      [rowId]
    );

    if (!rowData || rowData.length === 0) {
      return res.status(404).json({ message: "Balance entry not found" });
    }

    const transactionId = rowData[0].transaction_id;

    await executeQuery("DELETE FROM balance_entries WHERE id = ?", [rowId]);

    const totalSpentData = await executeQuery(
      "SELECT SUM(amount) AS totalSpent FROM balance_entries WHERE transaction_id = ?",
      [transactionId]
    );

    const totalSpent = Number(totalSpentData[0].totalSpent || 0);

    const trx = await executeQuery(
      "SELECT amount AS totalAmount FROM transactions WHERE id = ?",
      [transactionId]
    );
    const totalAmount = trx.length ? Number(trx[0].totalAmount) : 0;

    const newBalance = totalAmount - totalSpent;
    await executeQuery(
      "UPDATE transactions SET balance = ? WHERE id = ?",
      [newBalance, transactionId]
    );

    res.json({ message: "Row deleted successfully", newBalance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err });
  }
});


module.exports = router;
