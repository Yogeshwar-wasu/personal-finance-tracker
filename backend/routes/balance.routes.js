const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, getNextId } = require("../utils/jsonDb");

router.post("/save", (req, res) => {
  const rows = req.body.rows;
  const transactionId = Number(rows[0].transactionId);

  let entries = readJSON("balanceEntries.json")
    .filter(e => e.transaction_id !== transactionId);

  rows.forEach(r => {
    if (!r.name || !r.amount) return;
    entries.push({
      id: getNextId(entries),
      transaction_id: transactionId,
      name: r.name,
      amount: r.amount,
      date: r.date
    });
  });

  writeJSON("balanceEntries.json", entries);

  let transactions = readJSON("transactions.json");
  console.log("transactions", transactions);
  
  const trx = transactions.find(t => t.id === transactionId);
  console.log("trx",trx);
  

  const spent = entries
    .filter(e => e.transaction_id === transactionId)
    .reduce((s, e) => s + Number(e.amount), 0);

  trx.usedAmount = spent;
  trx.balance = trx.amount - spent;
  trx.status = spent === 0 ? "NOT_USED" :
               trx.balance <= 0 ? "FULL_USED" : "PARTIAL_USED";

  writeJSON("transactions.json", transactions);

  res.json({ message: "Saved", newBalance: trx.balance });
});

router.get("/all/:id", (req, res) => {
  const entries = readJSON("balanceEntries.json")
    .filter(e => e.transaction_id == req.params.id);

  const trx = readJSON("transactions.json")
    .find(t => t.id == req.params.id);

  res.json({
    list: entries,
    totalAmount: trx.amount,
    previousBalance: trx.balance
  });
});

router.delete("/delete/:id", (req, res) => {
  try {
    const entryId = Number(req.params.id);

    // 1️⃣ Read balance entries
    let entries = readJSON("balanceEntries.json");
    const entry = entries.find(e => e.id === entryId);

    if (!entry) {
      return res.status(404).json({ message: "Balance entry not found" });
    }

    const transactionId = entry.transaction_id;

    // 2️⃣ Remove the entry
    entries = entries.filter(e => e.id !== entryId);
    writeJSON("balanceEntries.json", entries);

    // 3️⃣ Calculate total used amount for this transaction
    const totalUsed = entries
      .filter(e => e.transaction_id === transactionId)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // 4️⃣ Update transaction JSON
    let transactions = readJSON("transactions.json");
    const trxIndex = transactions.findIndex(t => t.id === transactionId);

    if (trxIndex !== -1) {
      const totalAmount = Number(transactions[trxIndex].amount || 0);
      const newBalance = totalAmount - totalUsed;

      transactions[trxIndex].usedAmount = totalUsed;
      transactions[trxIndex].balance = newBalance;

      // Update status
      if (newBalance === 0) {
        transactions[trxIndex].status = "FULL_USED";
      } else if (newBalance < totalAmount) {
        transactions[trxIndex].status = "PARTIAL_USED";
      } else {
        transactions[trxIndex].status = "NOT_USED";
      }

      writeJSON("transactions.json", transactions);

      // 5️⃣ Return updated transaction info
      res.json({
        message: "Entry deleted and transaction updated",
        newBalance,
        usedAmount: totalUsed,
        status: transactions[trxIndex].status
      });
    } else {
      res.json({
        message: "Entry deleted but transaction not found",
        newBalance: null
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err });
  }
});



module.exports = router;
