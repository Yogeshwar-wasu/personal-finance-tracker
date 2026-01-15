const express = require("express");
const cors = require("cors");
const path = require("path"); // <- MUST include this
const app = express();

// ===================== IMPORT API ROUTES =====================
const transactionRoutes = require("./routes/transaction.routes");
const balanceRoutes = require("./routes/balance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const advanceRoutes = require("./routes/advance.routes");

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());

// ===================== API ROUTES =====================
// Prefix APIs with /api to avoid conflicts with Angular routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/advance", advanceRoutes);

// ===================== SERVE ANGULAR =====================
const angularDistPath = path.join(__dirname, "../frontend/dist/frontend"); // change 'frontend' if your Angular dist folder name differs
app.use(express.static(angularDistPath));

// Catch all other routes and return Angular index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(angularDistPath, "index.html"));
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
