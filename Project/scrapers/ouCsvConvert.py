import os
import re
import csv
import requests
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = "https://www.smogon.com/stats/"
OUTPUT_DIR = "ou_csv_files"

os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_months(start_year=2007):
    """
    Generate all months from start_year to current month.
    """
    now = datetime.now()
    months = []

    for year in range(start_year, now.year + 1):
        for month in range(1, 13):
            if year == now.year and month > now.month:
                break
            months.append(f"{year}-{month:02d}")

    return months


def get_ou_files(month):
    """
    Find all genXou-0.txt files in monthly Smogon stats page.
    """
    url = f"{BASE_URL}{month}/"
    print(f"\n📅 Checking {month}")

    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            print(f"❌ Failed to open {url}")
            return []

        soup = BeautifulSoup(r.text, "html.parser")
        files = []

        for a in soup.find_all("a"):
            href = a.get("href")
            if href and re.match(r"gen\d+ou-0\.txt$", href):
                files.append(url + href)

        return files

    except Exception as e:
        print(f"Error reading {month}: {e}")
        return []


def parse_ou_txt(text):
    """
    Parse Smogon OU text table into CSV rows:
    Rank, Pokemon, UsagePercent
    """
    rows = []

    for line in text.splitlines():
        line = line.rstrip()

        # Match table row:
        # | 1 | Tauros | 84.19211% | ...
        match = re.match(
            r"^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*([\d.]+)%\s*\|",
            line
        )

        if match:
            rank = match.group(1)
            pokemon = match.group(2).strip()
            usage = match.group(3)

            rows.append([
                rank,
                pokemon,
                usage
            ])

    return rows


def download_and_convert(file_url, month):
    """
    Download txt and convert directly into CSV.
    """
    filename = file_url.split("/")[-1]
    csv_filename = f"{month}_{filename.replace('.txt', '.csv')}"
    csv_path = os.path.join(OUTPUT_DIR, csv_filename)

    if os.path.exists(csv_path):
        print(f"⏩ Skipped existing: {csv_filename}")
        return

    try:
        r = requests.get(file_url, timeout=15)
        if r.status_code != 200:
            print(f"❌ Failed download: {file_url}")
            return

        rows = parse_ou_txt(r.text)

        if not rows:
            print(f"⚠ No rows found in {filename}")
            return

        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Rank",
                "Pokemon",
                "UsagePercent"
            ])
            writer.writerows(rows)

        print(f"✅ Saved: {csv_filename} ({len(rows)} rows)")

    except Exception as e:
        print(f"Download error: {e}")


def main():
    months = generate_months(2007)

    for month in months:
        ou_files = get_ou_files(month)

        for file_url in ou_files:
            download_and_convert(file_url, month)


if __name__ == "__main__":
    main()