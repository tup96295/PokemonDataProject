const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "PMDTTRPG Move Stats.csv");
const OUTPUT_FILE = path.join(__dirname, "moves_clean.csv");

// 🔥 Parse CSV safely (handles commas in quotes)
function parseCSV(content) {
    const rows = [];
    const lines = content.split("\n");

    for (let line of lines) {
        if (!line.trim()) continue;

        const result = [];
        let current = "";
        let inQuotes = false;

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        rows.push(result);
    }

    return rows;
}

function cleanEffect(effect) {
    if (!effect) return "";
    return effect.replace(/\?/g, "good attack for damage");
}

// 🔥 Escape CSV fields (important for commas in Effect)
function escapeCSV(value) {
    if (value.includes(",") || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function main() {
    const raw = fs.readFileSync(INPUT_FILE, "utf-8");
    const rows = parseCSV(raw);

    const data = rows.slice(1);

    const output = [];

    // Header
    output.push(["Name", "Type", "Category", "Effect"]);

    data.forEach((row) => {
        if (!row[1]) return;

        const name = row[1];
        const type = row[2];
        const category = row[3];
        const effect = cleanEffect(row[8]); // ✅ FIXED INDEX

        output.push([name, type, category, effect]);
    });

    // Convert to CSV string
    const csvString = output
        .map(row => row.map(escapeCSV).join(","))
        .join("\n");

    fs.writeFileSync(OUTPUT_FILE, csvString);

    console.log("✅ Done! Output saved to moves_clean.csv");
}

main();