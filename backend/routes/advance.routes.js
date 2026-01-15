const express = require("express");
const router = express.Router();
const { executeQuery } = require("../db");

router.post("/save", async (req, res) => {
  try {
    const rows = req.body.rows;

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "No rows provided" });
    }

    for (const row of rows) {
      let advanceItemId;

      if (row.id) {
        // Update existing advance_item
        await executeQuery(
          "UPDATE advance_item SET name = ?, amount = ? WHERE id = ?",
          [row.name, row.amount, row.id]
        );
        advanceItemId = row.id;
      } else {
        // Insert new advance_item
        const result = await executeQuery(
          "INSERT INTO advance_item (name, amount) VALUES (?, ?)",
          [row.name, row.amount]
        );
        advanceItemId = result.insertId;
      }

      // Handle payments
      let totalPayments = 0;
      if (row.payments && row.payments.length > 0) {
        for (const payment of row.payments) {
          const paymentDate = payment.date ? new Date(payment.date) : null;
          totalPayments += Number(payment.paymentAmount || 0);

          if (payment.id) {
            // Update existing payment
            await executeQuery(
              "UPDATE advance_payment SET payment_amount = ?, payment_date = ?, balance = ? WHERE id = ?",
              [payment.paymentAmount, paymentDate, payment.balance, payment.id]
            );
          } else {
            // Insert new payment
            await executeQuery(
              "INSERT INTO advance_payment (advance_item_id, payment_amount, payment_date, balance) VALUES (?, ?, ?, ?)",
              [advanceItemId, payment.paymentAmount, paymentDate, payment.balance]
            );
          }
        }
      }
      const amount = Number(row.amount || 0);
      const balanceAmount = amount - totalPayments;

      let status = "NOT_USED";
      if (balanceAmount === 0 && amount > 0) {
        status = "FULL_USED";
      } else if (balanceAmount < amount && balanceAmount > 0) {
        status = "PARTIAL_USED";
      }

      // 4️⃣ Update status
      await executeQuery(
        "UPDATE advance_item SET status = ? WHERE id = ?",
        [status, advanceItemId]
      );
    }

    res.json({ message: "Advance data saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Save failed", error: err });
  }
});


router.get("/all", async (req, res) => {
 try {
    // Get all advance items
    const items = await executeQuery("SELECT * FROM advance_item ORDER BY id ASC");

    // Get all payments
    const payments = await executeQuery("SELECT * FROM advance_payment ORDER BY id ASC");

    // Map payments to their advance item
    const data = items.map(item => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount),
      status: item.status,
      payments: payments
        .filter(p => p.advance_item_id === item.id)
        .map(p => ({
          id: p.id,
          paymentAmount: Number(p.payment_amount),
          date: p.payment_date ? p.payment_date.toISOString().split("T")[0] : "",
          balance: Number(p.balance)
        }))
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch advance items", error: err });
  }
});

router.delete("/delete-row/:id", async (req, res) => {
  try {
    const rowId = req.params.id;
console.log(rowId);

    await executeQuery("DELETE FROM advance_item WHERE id = ?", [rowId]);


    res.json({ message: "Row deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err });
  }
});
router.delete("/delete-payment/:id", async (req, res) => {
  try {
    const rowId = req.params.id;
    console.log(rowId);
    
    await executeQuery("DELETE FROM advance_payment WHERE id = ?", [rowId]);

    res.json({ message: "Row deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed", details: err });
  }
});


module.exports = router;
