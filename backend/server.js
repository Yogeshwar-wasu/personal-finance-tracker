const express = require("express");
const cors = require("cors");
const app = express();

const transactionRoutes = require("./routes/transaction.routes");
const balanceRoutes = require("./routes/balance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const advanceRoutes = require("./routes/advance.routes");

app.use(cors());
app.use(express.json());

app.use("/transactions", transactionRoutes);
app.use("/balance", balanceRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/advance", advanceRoutes);


app.listen(5000, () => console.log("Server running on port 5000"));
