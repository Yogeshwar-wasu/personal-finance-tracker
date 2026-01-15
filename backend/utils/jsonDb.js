const fs = require("fs");
const path = require("path");

function readJSON(file) {
  const filePath = path.join(__dirname, "..", "data", file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(file, data) {
  const filePath = path.join(__dirname, "..", "data", file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getNextId(list) {
  if (!list || list.length === 0) return 1; // start from 1
  // Sort by ID descending, take first
  const lastId = list.reduce((max, item) => item.id > max ? item.id : max, 0);
  return lastId + 1;
}


module.exports = { readJSON, writeJSON, getNextId };
