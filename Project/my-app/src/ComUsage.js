import React, { useEffect, useState, useCallback } from "react";
import UsageGraph from "./GraphUsage";
import GenStats from "./GenStats";
import PokemonBuildPanel from "./buildPanel";

const POKE_PATH = "/pokemon_data/";

const images = require.context(
  "../public/pokemon_artwork",
  false,
  /\.jpg$/
);

const imageSet = new Set(
  images.keys().map((key) =>
    key.replace("./", "").replace(".jpg", "")
  )
);

export default function ComUsage({ theme }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [selectedGen, setSelectedGen] = useState("9");
  const [battleMode, setBattleMode] = useState("doubles");
  const [clickedBuild, setClickedBuild] = useState(null);
  const [viewMode, setViewMode] = useState("usage");
  const [filterOpen, setFilterOpen] = useState(true);
  const [secondaryBuilds, setSecondaryBuilds] = useState([]);
  const [popupPos, setPopupPos] = useState({ x: 200, y: 150 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stopDrag = () => setDragging(false);

  const normalize = (str) =>
    str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

  const formatName = (name) =>
    name
      ?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const getImage = (name) => {
    const formatted = formatName(name);

    if (imageSet.has(formatted)) {
      return `/pokemon_artwork/${formatted}.jpg`;
    }

    const base = formatName(name.split(" ")[0]);
    if (imageSet.has(base)) {
      return `/pokemon_artwork/${base}.jpg`;
    }

    return "/pokemon_artwork/default.png";
  };

  const loadCSV = async (path) => {
    const res = await fetch(path);
    return await res.text();
  };

  const parseCSV = (text) =>
    text
      .trim()
      .split("\n")
      .slice(1)
      .map((r) =>
        r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      );

  useEffect(() => {
    const loadData = async () => {
      const text = await loadCSV(
        POKE_PATH + "pokemon_all.csv"
      );

      const rows = parseCSV(text);

      const list = rows.map((row) => ({
        display: row[1],
        smogon: normalize(row[1]),
        types: row[2]
          ? row[2].toLowerCase().split(" ")
          : [],
      }));

      setPokemonList(list);
      setFilteredList(list);
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtered = pokemonList.filter((p) => {
      const matchesSearch =
        normalize(p.display).includes(normalize(search));

      const matchesType =
        selectedType === "all" ||
        p.types.includes(selectedType);

      return matchesSearch && matchesType;
    });

    setFilteredList(filtered);

    if (filtered.length === 1) {
      setSelectedPokemon(filtered[0]);
    }
  }, [search, selectedType, pokemonList]);

  const removePokemon = (name) => {
    setCompareList(compareList.filter((p) => p.display !== name));
  };

  const startDrag = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - popupPos.x,
      y: e.clientY - popupPos.y,
    });
  };

  const clamp = (val, min, max) => Math.max(min, Math.min(val, max));

  const onDrag = useCallback((e) => {
    if (!dragging) return;

    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;

    setPopupPos({
      x: clamp(newX, 0, window.innerWidth - 320),
      y: clamp(newY, 0, window.innerHeight - 100),
    });
  }, [dragging, offset]);

  useEffect(() => {
    const handleMove = (e) => onDrag(e);
    const handleUp = () => stopDrag();

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [onDrag]);
  return (
    <div style={{ background: theme.bg, color: theme.text }}>

      {/* TOP FILTER BAR */}
      <div style={{ padding: 15, background: theme.card }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "10px",
            background: theme.header,
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pokémon"
            style={{
              padding: "5px",
              minWidth: "200px",
              background: theme.card,
              color: theme.text,
              border: "none",
            }}
          />

          <div>
            <label>Type: </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ background: theme.card, color: theme.text }}
            >
              <option value="all">All</option>
              <option value="normal">Normal</option>
              <option value="fire">Fire</option>
              <option value="water">Water</option>
              <option value="electric">Electric</option>
              <option value="grass">Grass</option>
              <option value="ice">Ice</option>
              <option value="fighting">Fighting</option>
              <option value="poison">Poison</option>
              <option value="ground">Ground</option>
              <option value="flying">Flying</option>
              <option value="psychic">Psychic</option>
              <option value="bug">Bug</option>
              <option value="rock">Rock</option>
              <option value="ghost">Ghost</option>
              <option value="dragon">Dragon</option>
              <option value="dark">Dark</option>
              <option value="steel">Steel</option>
              <option value="fairy">Fairy</option>
            </select>
          </div>

          <div>
            <label>Battle Mode: </label>
            <select
              value={battleMode}
              onChange={(e) => setBattleMode(e.target.value)}
              style={{ background: theme.card, color: theme.text }}
            >
              <option value="singles">Singles</option>
              <option value="doubles">Doubles</option>
            </select>
          </div>

          <div>
            <label>Generation: </label>
            <select
              value={selectedGen}
              onChange={(e) => setSelectedGen(e.target.value)}
              style={{ background: theme.card, color: theme.text }}
            >
              {[5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  Gen {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>View: </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              style={{ background: theme.card, color: theme.text }}
            >
              <option value="usage">Usage Graph</option>
              <option value="stats">Stats Chart</option>
            </select>
          </div>
        </div>

        {filterOpen && (
          <>
            <div style={{ maxHeight: 150, overflowY: "auto" }}>
              {filteredList.map((p) => (
                <div
                  key={p.display}
                  onClick={() => {
                    setSelectedPokemon(p);
                    setCompareList((prev) => {
                      if (prev.find((x) => x.display === p.display)) return prev;
                      return [...prev, p];
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 4,
                    cursor: "pointer",
                    fontSize: "14px",
                    background:
                      compareList.find((x) => x.display === p.display)
                        ? "#2a4d6b"
                        : selectedPokemon?.display === p.display
                          ? "#444"
                          : "transparent",
                  }}
                >
                  <img
                    src={getImage(p.display)}
                    alt={p.display}
                    style={{
                      width: 22,
                      height: 22,
                      objectFit: "contain",
                    }}
                  />
                  {p.display}
                </div>
              ))}
            </div>

            <br />

            {compareList.length > 0 && (
              <button
                onClick={() => setCompareList([])}
                style={{
                  padding: "5px 10px",
                  background: theme.button,
                  color: theme.text,
                }}
              >
                Remove All
              </button>
            )}

            <hr />

            {compareList.map((p) => (
              <div key={p.display}>
                {p.display}
                <button onClick={() => removePokemon(p.display)}>X</button>
              </div>
            ))}
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => setFilterOpen(!filterOpen)}>
            {filterOpen ? "Hide Filter ▲" : "Show Filter ▼"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", gap: 30, marginTop: 20 }}>

        {/* GRAPH */}
        <div style={{ flex: 3 }}>
          {viewMode === "usage" ? (
            <UsageGraph
              compareList={compareList}
              selectedGen={selectedGen}
              battleMode={battleMode}
              onPointClick={(build) => {
                setClickedBuild(build);
                setSecondaryBuilds([]);
              }}
              theme={theme}
            />
          ) : (
            <GenStats compareList={compareList} theme={theme} />
          )}
        </div>

        {/* MAIN PANEL */}
        <div style={{ width: 350 }}>
          <PokemonBuildPanel
            clickedBuild={clickedBuild}
            battleMode={battleMode}
            theme={theme}
            onTeammateClick={(build) => {
              setSecondaryBuilds((prev) => [...prev, build]);
            }} isMain={true}
          />
        </div>
      </div>

      {secondaryBuilds.map((build, index) => (
        <div
          key={index}
          style={{
            position: "fixed",
            top: 100 + index * 30,
            left: 200 + index * 30,
            width: "320px",
            maxHeight: "70vh",
            background: theme.card,
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0,0,0,0.6)",
            zIndex: 9999,
            border: `1px solid ${theme.header}`,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "8px",
              background: theme.header,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px" }}>Teammate Build</span>

            <button
              onClick={() =>
                setSecondaryBuilds((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
              style={{
                background: "transparent",
                border: "none",
                color: theme.text,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <PokemonBuildPanel
              clickedBuild={build}
              battleMode={battleMode}
              theme={theme}
              isMain={false}
              onTeammateClick={(newBuild) => {
                setSecondaryBuilds((prev) => [...prev, newBuild]);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

}