const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

router.post("/add", async (req, res) => {
  try {
    const transaction = req.body;

    const status = transaction.status?.trim() || 'NOT_USED';

    if (transaction.id && Number(transaction.id) > 0) {
      const sqlUpdate = `
        UPDATE transactions SET
          description = ?,
          amount = ?,
          balance = ?,
          category = ?,
          paymentMethod = ?,
          date = ?,
          notes = ?,
          status = ?
        WHERE id = ?
      `;

      await executeQuery(sqlUpdate, [
        transaction.description,
        transaction.amount,
        transaction.balance,
        transaction.category,
        transaction.paymentMethod,
        transaction.date,
        transaction.notes,
        status,
        transaction.id
      ]);

      return res.json({ message: "Transaction updated successfully" });

    }

    const sqlInsert = `
      INSERT INTO transactions
        (description, amount, usedAmount, balance, category, paymentMethod, date, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(sqlInsert, [
      transaction.description,
      transaction.amount,
      transaction.usedAmount,
      transaction.amount,
      transaction.category,
      transaction.paymentMethod,
      transaction.date,
      transaction.notes,
      status
    ]);

    res.json({ message: "Transaction saved", insertId: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert/Update failed", details: err });
  }
});


router.get("/all", async (req, res) => {
  try {
    const rows = await executeQuery(
      `SELECT 
         id,
         description,
         amount,
         usedAmount,
         balance,
         category,
         paymentMethod,
         DATE_FORMAT(date, '%Y-%m-%d') AS date,
         notes,
         status
       FROM transactions`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error", details: err });
  }
});


router.delete("/delete/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const trxData = await executeQuery("SELECT id FROM transactions WHERE id = ?", [transactionId]
    );

    if (!trxData || trxData.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await executeQuery("DELETE FROM balance_entries WHERE transaction_id = ?", [transactionId]
    );

    await executeQuery("DELETE FROM transactions WHERE id = ?", [transactionId]
    );

    res.json({ message: "Transaction and its balance entries deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;

    const rows = await executeQuery(
      "SELECT  id,description,amount,usedAmount,balance,category,paymentMethod,DATE_FORMAT(date, '%Y-%m-%d') AS date,notes,status FROM transactions WHERE id = ? ",
      [transactionId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database Error", details: err });
  }
});



module.exports = router;
