const fs = require("fs");
const path = require("path");

// correct path
const dir = path.join(__dirname, "public", "smogon_csv");


const files = fs.readdirSync(dir)
  .filter(file => file.endsWith(".csv"))
  .sort();

fs.writeFileSync(
  path.join(dir, "files.json"),
  JSON.stringify({ files }, null, 2)
);

console.log("files.json generated!");