const mysql = require("mysql2");

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'Yogesh@123',
  database: 'Finance_Tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const poolPromise = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log("✅ Database Connected Successfully!");
    connection.release();
  }
});

async function executeQuery(sql, params = []) {
  try {
    const [rows] = await poolPromise.query(sql, params);
    return rows;
  } catch (err) {
    console.error("Database Query Error:", err);
    throw err;
  }
}

async function executeProcedure(procName, params = []) {
  try {
    const placeholders = params.map(() => "?").join(", ");
    const query = `CALL ${procName}(${placeholders})`;
    const [results] = await poolPromise.query(query, params);

    return results[0];
  } catch (err) {
    console.error("Stored Procedure Error:", err);
    throw err;
  }
}

module.exports = {
  executeQuery,
  executeProcedure
};

