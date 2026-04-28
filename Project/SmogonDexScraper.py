import json
import re
import requests
import time
import os  # 🔥 NEW

URL = "https://www.smogon.com/dex/sv/pokemon/"
GEN = "sv"
OUTPUT_DIR = "pokemon_data"  # 🔥 NEW

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def fetch_dex_settings(url: str) -> dict:
    html = requests.get(url, headers={"User-Agent": UA}, timeout=30).text
    m = re.search(r"dexSettings\s*=\s*", html)
    if not m:
        raise RuntimeError("dexSettings blob not found in page")
    data, _ = json.JSONDecoder().raw_decode(html[m.end():])
    return data


def rpc_map(settings: dict) -> dict:
    out = {}
    for key_json, payload in settings.get("injectRpcs", []):
        key = json.loads(key_json)
        name, args = key[0], key[1] if len(key) > 1 else {}
        out[(name, tuple(sorted(args.items())))] = payload
    return out


def extract_all(gen: str):
    base_url = f"https://www.smogon.com/dex/{gen}/pokemon/"
    settings = fetch_dex_settings(base_url)
    rpcs = rpc_map(settings)

    basics = rpcs.get(("dump-basics", (("gen", gen),)))
    if basics is None:
        raise RuntimeError("dump-basics not found")

    all_pokemon = basics["pokemon"]

    print(f"Found {len(all_pokemon)} Pokémon")

    # 🔥 CREATE OUTPUT FOLDER
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for i, p in enumerate(all_pokemon):
        name = p["name"]
        alias = name.lower().replace(" ", "-")

        try:
            url = f"https://www.smogon.com/dex/{gen}/pokemon/{alias}/"
            settings = fetch_dex_settings(url)
            rpcs = rpc_map(settings)

            pokemon = rpcs.get(
                ("dump-pokemon", (("alias", alias), ("gen", gen), ("language", "en")))
            )

            if pokemon is None:
                print(f"⚠️ Skipped {name}")
                continue

            data = {
                "name": name,
                "alias": alias,
                "types": p.get("types"),
                "stats": [p.get(s) for s in ("hp", "atk", "def", "spa", "spd", "spe")],
                "strategies": pokemon.get("strategies", []),
                "learnset": pokemon.get("learnset", []),
            }

            # 🔥 SAVE INDIVIDUAL FILE
            file_path = os.path.join(OUTPUT_DIR, f"{alias}.json")
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"[{i+1}/{len(all_pokemon)}] ✓ Saved {alias}.json")

            time.sleep(0.3)

        except Exception as e:
            print(f"❌ Error with {name}: {e}")


if __name__ == "__main__":
    extract_all(GEN)
    print("\nDone. All Pokémon saved individually.")