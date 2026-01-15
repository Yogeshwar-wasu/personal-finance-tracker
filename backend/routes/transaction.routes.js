const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, getNextId } = require("../utils/jsonDb");

router.post("/add", (req, res) => {
  let data = readJSON("transactions.json");
  const t = req.body;

  if (t.id && t.id > 0) {
    // Existing transaction → update
    const trx = data.find(x => x.id === t.id);
    if (!trx) return res.status(404).json({ message: "Transaction not found" });
    Object.assign(trx, t);
    writeJSON("transactions.json", data);
    return res.json({ message: "Updated", id: t.id });
  }

  // New transaction → generate unique ID
  const newId = getNextId(data);
  console.log("newId:", newId);
  

  const newTransaction = {
        ...t,
    id: newId,
    usedAmount: 0,
    balance: t.amount,
    status: "NOT_USED"
  };
console.log("newTransaction",newTransaction);

  data.push(newTransaction);
  writeJSON("transactions.json", data);

  res.json({ message: "Inserted", id: newId });
});


router.get("/all", (req, res) => {
  res.json(readJSON("transactions.json"));
});

router.get("/:id", (req, res) => {
  const trx = readJSON("transactions.json").find(t => t.id == req.params.id);
  res.json(trx);
});

router.delete("/delete/:id", (req, res) => {
  writeJSON(
    "transactions.json",
    readJSON("transactions.json").filter(t => t.id != req.params.id)
  );
  writeJSON(
    "balanceEntries.json",
    readJSON("balanceEntries.json").filter(b => b.transaction_id != req.params.id)
  );
  res.json({ message: "Deleted" });
});

module.exports = router;
