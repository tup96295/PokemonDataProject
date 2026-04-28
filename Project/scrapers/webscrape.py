import requests
from bs4 import BeautifulSoup
import csv

url = "https://pokemondb.net/pokedex/all"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

table = soup.find("table", {"id": "pokedex"})
rows = table.find("tbody").find_all("tr")

# Generation function
def get_generation(dex):
    dex = int(dex)
    if dex <= 151: return 1
    elif dex <= 251: return 2
    elif dex <= 386: return 3
    elif dex <= 493: return 4
    elif dex <= 649: return 5
    elif dex <= 721: return 6
    elif dex <= 809: return 7
    elif dex <= 905: return 8
    else: return 9

# Store all data
all_pokemon = []
gen_groups = {i: [] for i in range(1, 10)}

for row in rows:
    cols = row.find_all("td")

    dex = cols[0].text.strip()
    name = cols[1].text.strip()

    types = " ".join([t.text for t in cols[2].find_all("a")])

    total = cols[3].text.strip()
    hp = cols[4].text.strip()
    attack = cols[5].text.strip()
    defense = cols[6].text.strip()
    spatk = cols[7].text.strip()
    spdef = cols[8].text.strip()
    speed = cols[9].text.strip()

    gen = get_generation(dex)

    row_data = [dex, name, types, gen, total, hp, attack, defense, spatk, spdef, speed]

    all_pokemon.append(row_data)
    gen_groups[gen].append(row_data)

# Headers
headers = ["Dex", "Name", "Type", "Generation", "Total", "HP", "Attack", "Defense", "SpAtk", "SpDef", "Speed"]

# Save full CSV
with open("pokemon_all.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(all_pokemon)

# Save per-generation CSVs
for gen, data in gen_groups.items():
    with open(f"pokemon_gen_{gen}.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(data)

print("All CSV files created successfully!")