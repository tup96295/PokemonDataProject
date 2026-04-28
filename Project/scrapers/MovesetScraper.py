import re
import json
import requests
import os
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = "https://www.smogon.com/stats/"
OUTPUT_DIR = "movesets"

os.makedirs(OUTPUT_DIR, exist_ok=True)

SECTION_HEADERS = {
    "Abilities",
    "Items",
    "Spreads",
    "Moves",
    "Tera Types",
    "Teammates",
    "Checks and Counters"
}


def is_border(line):
    return line.strip().startswith("+") and line.strip().endswith("+")


def clean_line(line):
    return line.strip().strip("|").strip()


def is_pokemon_name(line):
    return (
        line
        and ":" not in line
        and "%" not in line
        and line not in SECTION_HEADERS
        and not line.startswith("+")
        and not re.match(r"^-+$", line)
    )


def parse_lines(lines):
    data = []
    current_pokemon = None
    current_section = None

    i = 0
    while i < len(lines):
        raw_line = lines[i]
        line = clean_line(raw_line)

        if is_border(raw_line):
            if i + 1 < len(lines) and not is_border(lines[i + 1]):
                content = clean_line(lines[i + 1])

                if not content or content.startswith("+"):
                    i += 1
                    continue

                if is_pokemon_name(content):
                    if current_pokemon:
                        data.append(current_pokemon)

                    current_pokemon = {
                        "name": content,
                        "stats": {},
                        "sections": {}
                    }
                    current_section = None
                    i += 2
                    continue

                if current_pokemon and content in SECTION_HEADERS:
                    current_section = content
                    current_pokemon["sections"][current_section] = []
                    i += 2
                    continue

        if ":" in line and current_pokemon:
            key, value = map(str.strip, line.split(":", 1))
            current_pokemon["stats"][key] = value
            i += 1
            continue

        if current_section and current_pokemon:
            if line:
                match = re.match(r"(.+?)\s+([\d.]+)%$", line)
                if match:
                    current_pokemon["sections"][current_section].append({
                        "name": match.group(1).strip(),
                        "usage": float(match.group(2))
                    })

        i += 1

    if current_pokemon:
        data.append(current_pokemon)

    return data


def parse_url(url):
    print(f"📥 {url}")
    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            return None
        return parse_lines(r.text.splitlines())
    except Exception as e:
        print("Error parsing URL:", e)
        return None


def generate_months(start_year=2007):
    now = datetime.now()
    months = []

    for y in range(start_year, now.year + 1):
        for m in range(1, 13):
            if y == now.year and m > now.month:
                break
            months.append(f"{y}-{m:02d}")

    return months


def get_moveset_files(month):
    """
    Grab ALL Smogon OU moveset files:
    gen5ou-0.txt
    gen6ou-0.txt
    gen7ou-0.txt
    gen8ou-0.txt
    gen9ou-0.txt
    etc.
    """
    url = f"{BASE_URL}{month}/moveset/"
    print(f"\n📅 {month}")

    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            return []

        soup = BeautifulSoup(r.text, "html.parser")
        files = []

        for a in soup.find_all("a"):
            href = a.get("href")
            if not href:
                continue

            # Match ONLY genXou-0.txt
            if re.match(r"gen\d+ou-0\.txt$", href):
                files.append(url + href)

        return files

    except Exception as e:
        print("Error getting moveset files:", e)
        return []


def main():
    months = generate_months(2007)

    for month in months:
        files = get_moveset_files(month)

        for file_url in files:
            parsed = parse_url(file_url)
            if not parsed:
                continue

            filename = file_url.split("/")[-1].replace(".txt", ".json")
            path = os.path.join(
                OUTPUT_DIR,
                f"{month}_{filename}"
            )

            with open(path, "w", encoding="utf-8") as f:
                json.dump(parsed, f, indent=2)

            print("💾 Saved:", path)


if __name__ == "__main__":
    main()