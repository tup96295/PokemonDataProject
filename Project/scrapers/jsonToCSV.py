import os
import json
import csv

INPUT_FOLDER = "movesets"
OUTPUT_FOLDER = "csv_movesets"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)


def extract_percent(value):
    if "%" in value:
        return value.split()[-1].replace("%", "")
    return value


def flatten_pokemon(pokemon, source):
    rows = []
    name = pokemon["name"]

    # stats
    for k, v in pokemon["stats"].items():
        rows.append({
            "source": source,
            "pokemon": name,
            "category": "Stats",
            "type": k,
            "name": "",
            "usage": extract_percent(v)
        })

    # sections
    for section, entries in pokemon["sections"].items():
        for e in entries:
            rows.append({
                "source": source,
                "pokemon": name,
                "category": section,
                "type": "",
                "name": e.get("name", ""),
                "usage": e.get("usage", "")
            })

    return rows


def convert_file(json_path, csv_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    rows = []
    source = os.path.basename(json_path)

    for p in data:
        rows.extend(flatten_pokemon(p, source))

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["source", "pokemon", "category", "type", "name", "usage"]
        )
        writer.writeheader()
        writer.writerows(rows)


def main():
    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith(".json")]

    print(f"Found {len(files)} JSON files")

    for f in files:
        in_path = os.path.join(INPUT_FOLDER, f)
        out_path = os.path.join(OUTPUT_FOLDER, f.replace(".json", ".csv"))

        convert_file(in_path, out_path)
        print("✅", f)


if __name__ == "__main__":
    main()