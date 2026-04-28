import os
import json

INPUT_FOLDER = "csv_movesets"
OUTPUT_FILE = "all_movesets.json"


def generate_file_manifest_json():
    files = sorted([
        f for f in os.listdir(INPUT_FOLDER)
        if f.endswith(".csv")
    ])

    print(f"Found {len(files)} CSV files")

    manifest = {
        "files": files
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"✅ Saved JSON manifest: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_file_manifest_json()
    