import os
import re
import requests
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = "https://www.smogon.com/stats/"
OUTPUT_DIR = "ou_txt_files"

os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_months(start_year=2007):
    """
    Generate every month from start_year to current month
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
    Scan month directory directly:
    https://www.smogon.com/stats/YYYY-MM/

    Grab all:
    gen5ou-0.txt
    gen6ou-0.txt
    gen7ou-0.txt
    etc.
    """
    url = f"{BASE_URL}{month}/"
    print(f"\n📅 Checking {month}")

    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            print(f"❌ Failed to access {url}")
            return []

        soup = BeautifulSoup(r.text, "html.parser")
        files = []

        for a in soup.find_all("a"):
            href = a.get("href")
            if not href:
                continue

            if re.match(r"gen\d+ou-0\.txt$", href):
                files.append(url + href)

        return files

    except Exception as e:
        print(f"Error reading {month}: {e}")
        return []


def download_file(file_url, month):
    """
    Download OU txt file
    """
    filename = file_url.split("/")[-1]
    save_path = os.path.join(
        OUTPUT_DIR,
        f"{month}_{filename}"
    )

    if os.path.exists(save_path):
        print(f"⏩ Skipped existing: {save_path}")
        return

    try:
        r = requests.get(file_url, timeout=15)
        if r.status_code == 200:
            with open(save_path, "wb") as f:
                f.write(r.content)
            print(f"💾 Saved: {save_path}")
        else:
            print(f"❌ Failed download: {file_url}")

    except Exception as e:
        print(f"Download error: {e}")


def main():
    months = generate_months(2007)

    for month in months:
        ou_files = get_ou_files(month)

        for file_url in ou_files:
            download_file(file_url, month)


if __name__ == "__main__":
    main()