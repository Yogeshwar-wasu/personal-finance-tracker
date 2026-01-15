const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, getNextId } = require("../utils/jsonDb");

router.post("/save", (req, res) => {
  try {
    const rows = req.body.rows;
    if (!rows || !rows.length) return res.status(400).json({ message: "No rows provided" });

    let items = readJSON("advanceItems.json");
    let payments = readJSON("advancePayments.json");

    rows.forEach(row => {
      let itemId;

      if (row.id) {
        const item = items.find(i => i.id === row.id);
        item.name = row.name;
        item.amount = row.amount;
        itemId = item.id;
      } else {
        itemId = getNextId(items);
        items.push({
          id: itemId,
          name: row.name,
          amount: row.amount,
          status: "NOT_USED"
        });
      }

      let totalPayments = 0;

      (row.payments || []).forEach(p => {
        totalPayments += Number(p.paymentAmount || 0);

        if (p.id) {
          const pay = payments.find(x => x.id === p.id);
          pay.paymentAmount = p.paymentAmount;
          pay.date = p.date;
          pay.balance = p.balance;
        } else {
          payments.push({
            id: getNextId(payments),
            advance_item_id: itemId,
            paymentAmount: p.paymentAmount,
            date: p.date,
            balance: p.balance
          });
        }
      });

      const balance = row.amount - totalPayments;
      const item = items.find(i => i.id === itemId);

      item.status =
        balance === 0 ? "FULL_USED" :
        balance < row.amount ? "PARTIAL_USED" : "NOT_USED";
    });

    writeJSON("advanceItems.json", items);
    writeJSON("advancePayments.json", payments);

    res.json({ message: "Advance data saved successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/all", (req, res) => {
  const items = readJSON("advanceItems.json");
  const payments = readJSON("advancePayments.json");

  res.json(items.map(i => ({
    ...i,
    payments: payments.filter(p => p.advance_item_id === i.id)
  })));
});

router.delete("/delete-row/:id", (req, res) => {
  let items = readJSON("advanceItems.json").filter(i => i.id != req.params.id);
  let payments = readJSON("advancePayments.json").filter(p => p.advance_item_id != req.params.id);

  writeJSON("advanceItems.json", items);
  writeJSON("advancePayments.json", payments);

  res.json({ message: "Row deleted" });
});

router.delete("/delete-payment/:id", (req, res) => {
  let payments = readJSON("advancePayments.json").filter(p => p.id != req.params.id);
  writeJSON("advancePayments.json", payments);
  res.json({ message: "Payment deleted" });
});

module.exports = router;
