import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://pokemondb.net"
NATIONAL_URL = "https://pokemondb.net/pokedex/national"
OUTPUT_DIR = "pokemon_artwork"

os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}


# -----------------------------------
# Get Pokémon page links
# -----------------------------------
def get_pokemon_links():
    print("Fetching National Pokédex...")

    r = requests.get(NATIONAL_URL, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")

    links = []

    for a in soup.select("a.ent-name"):
        href = a.get("href")

        if href and href.startswith("/pokedex/"):
            full_url = urljoin(BASE_URL, href)

            if full_url not in links:
                links.append(full_url)

    print(f"Found {len(links)} Pokémon.")
    return links


# -----------------------------------
# Extract top artwork image
# -----------------------------------
def get_main_image(soup):
    """
    Grabs the large artwork image at top of page
    """
    img = soup.select_one("div.grid-col.span-md-6 img")

    if img and img.get("src"):
        return img.get("src")

    # fallback (rare layout cases)
    img = soup.find("img")
    if img:
        return img.get("src")

    return None


# -----------------------------------
# Download artwork
# -----------------------------------
def download_artwork(pokemon_url):
    r = requests.get(pokemon_url, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")

    name = pokemon_url.split("/")[-1]

    img_url = get_main_image(soup)

    if not img_url:
        print(f"❌ No artwork: {name}")
        return

    img_url = urljoin(BASE_URL, img_url)

    img_data = requests.get(img_url, headers=HEADERS).content

    ext = img_url.split(".")[-1].split("?")[0]

    save_path = os.path.join(
        OUTPUT_DIR,
        f"{name}.{ext}"
    )

    with open(save_path, "wb") as f:
        f.write(img_data)

    print(f"✅ Saved: {name}")


# -----------------------------------
# Main
# -----------------------------------
def main():
    pokemon_links = get_pokemon_links()

    for link in pokemon_links:
        try:
            download_artwork(link)
        except Exception as e:
            print(f"Error on {link}: {e}")


if __name__ == "__main__":
    main()