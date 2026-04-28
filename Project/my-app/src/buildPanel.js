import { useCallback, useEffect, useState } from "react";
import { normalizePokemonName } from "./normalizePokemon";

const getMovesetPath = (battleMode) =>
    battleMode === "singles"
        ? "/singles/csv_movesets/"
        : "/doubles/csv_movesets/";

let moveDataMap = {};

// ─── PokéAPI Modal ────────────────────────────────────────────────────────────
function PokeAPIModal({ pokemonName, theme, onClose }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const TYPE_COLORS = {
        fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
        ice: "#98D8D8", fighting: "#790c06", poison: "#A040A0", ground: "#e5ab0a",
        flying: "#A890F0", psychic: "#F85888", bug: "#74800a", rock: "#675403",
        ghost: "#4b2d56", dragon: "#7038F8", dark: "#2b2624", steel: "#B8B8D0",
        fairy: "#EE99AC", normal: "#A8A878",
    };

    const STAT_COLORS = {
        hp: "#FF5959", attack: "#F5AC78", defense: "#FAE078",
        "special-attack": "#9DB7F5", "special-defense": "#A7DB8D", speed: "#FA92B2",
    };

    const STAT_LABELS = {
        hp: "HP", attack: "Atk", defense: "Def",
        "special-attack": "SpA", "special-defense": "SpD", speed: "Spe",
    };

    useEffect(() => {
        const normalized = pokemonName.toLowerCase().replace(/\s+/g, "-");
        fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`)
            .then((r) => {
                if (!r.ok) throw new Error("Not found");
                return r.json();
            })
            .then(setData)
            .catch(() => setError("Could not load Pokémon data."));
    }, [pokemonName]);

    const overlay = {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999,
    };

    const modal = {
        background: theme.card,
        color: theme.text,
        border: `1px solid ${theme.header}`,
        borderRadius: "12px",
        padding: "20px",
        width: "90%", maxWidth: "420px",
        maxHeight: "80vh", overflowY: "auto",
        position: "relative",
    };

    const closeBtn = {
        position: "absolute", top: "10px", right: "14px",
        background: "none", border: "none",
        fontSize: "20px", cursor: "pointer", color: theme.text,
    };

    return (
        <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={modal}>
                <button style={closeBtn} onClick={onClose}>×</button>

                {error && <p style={{ color: "#e55" }}>{error}</p>}

                {!data && !error && (
                    <p style={{ color: theme.text, opacity: 0.6 }}>Loading...</p>
                )}

                {data && (() => {
                    const total = data.stats.reduce((s, x) => s + x.base_stat, 0);
                    const smogonName = pokemonName.toLowerCase().replace(/\s+/g, "-");
                    return (
                        <>
                            {/* Header */}
                            <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "14px" }}>
                                <img
                                    src={data.sprites.front_default}
                                    alt={data.name}
                                    style={{ width: "80px", imageRendering: "pixelated" }}
                                />
                                <div>
                                    <h3 style={{ textTransform: "capitalize", margin: "0 0 6px" }}>
                                        {data.name.replace(/-/g, " ")}
                                    </h3>

                                    {/* Types */}
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                        {data.types.map((t) => (
                                            <span key={t.type.name} style={{
                                                background: TYPE_COLORS[t.type.name] || "#888",
                                                color: "#fff",
                                                fontSize: "11px",
                                                padding: "2px 10px",
                                                borderRadius: "20px",
                                                textTransform: "capitalize",
                                                fontWeight: "500",
                                            }}>
                                                {t.type.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* BST */}
                                    <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "6px" }}>
                                        BST: {total}
                                    </div>

                                    {/* Smogon link */}
                                    <a
                                        href={`https://www.smogon.com/dex/sv/pokemon/${smogonName}/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ fontSize: "12px", color: "#6890F0", display: "block", marginTop: "4px" }}
                                    >
                                        View on Smogon ↗
                                    </a>
                                </div>
                            </div>

                            {/* Base Stats */}
                            <div style={{ marginBottom: "14px" }}>
                                <strong style={{ fontSize: "13px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Base Stats
                                </strong>
                                {data.stats.map((s) => {
                                    const key = s.stat.name;
                                    const pct = Math.round((s.base_stat / 255) * 100);
                                    return (
                                        <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                                            <span style={{ fontSize: "12px", opacity: 0.6, width: "36px", textAlign: "right" }}>
                                                {STAT_LABELS[key] || key}
                                            </span>
                                            <div style={{ flex: 1, height: "6px", background: "rgba(128,128,128,0.2)", borderRadius: "3px", overflow: "hidden" }}>
                                                <div style={{ width: `${pct}%`, height: "100%", background: STAT_COLORS[key] || "#888", borderRadius: "3px" }} />
                                            </div>
                                            <span style={{ fontSize: "12px", fontWeight: "500", width: "28px" }}>
                                                {s.base_stat}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Abilities */}
                            <div>
                                <strong style={{ fontSize: "13px", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Abilities
                                </strong>
                                {data.abilities.map((a) => (
                                    <div key={a.ability.name} style={{ fontSize: "13px", marginTop: "4px", textTransform: "capitalize" }}>
                                        {a.ability.name.replace(/-/g, " ")}
                                        {a.is_hidden && (
                                            <span style={{ opacity: 0.5, fontSize: "11px", marginLeft: "6px" }}>(hidden)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PokemonBuildPanel({
    clickedBuild,
    battleMode,
    theme,
    onTeammateClick,
    isMain
}) {
    const [buildData, setBuildData] = useState(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [cache, setCache] = useState({});
    const [apiModal, setApiModal] = useState(null);
    const [showOverview, setShowOverview] = useState(false);
    const [overviewData, setOverviewData] = useState(null);

    const MOVESET_PATH = getMovesetPath(battleMode);

    const normalize = (name) =>
        name
            ?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

    const resolveImage = useCallback((name) => {
        return `/pokemon_artwork/${normalize(name)}.jpg`;
    }, []);

    const handleImgError = (e, name) => {
        const base = `/pokemon_artwork/${normalize(name)}`;
        if (e.target.src.endsWith(".jpg")) {
            e.target.src = `${base}.png`;
        } else {
            e.target.style.display = "none";
        }
    };

    const loadCSV = async (path) => {
        const res = await fetch(path);
        return await res.text();
    };

    const parseCSV = (text) =>
        text
            .trim()
            .split(/\r?\n/)
            .slice(1)
            .map((r) =>
                r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            );

    useEffect(() => {
        const loadMoveCSV = async () => {
            const res = await fetch("/Move_Stats.csv");
            const text = await res.text();

            const lines = text.trim().split(/\r?\n/);
            const header = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            const colIndex = {};
            header.forEach((col, i) => {
                colIndex[col.trim()] = i;
            });

            const rows = lines.slice(1).map(r =>
                r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            );

            const map = {};

            rows.forEach(row => {
                const rawName = row[colIndex["Move"]];
                if (!rawName) return;

                const name = rawName.toLowerCase().trim();
                const effectRaw = row[colIndex["Effect"]];

                map[name] = {
                    type: row[colIndex["Type"]],
                    category: row[colIndex["Category"]],
                    effect: (effectRaw || "")
                        .replace(/\?/g, "good attack for damage")
                        .replace(/\uFFFD/g, "")
                        .trim(),
                };
            });

            moveDataMap = map;
        };

        loadMoveCSV();
    }, []);

    const typeColors = {
        fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
        ice: "#98D8D8", fighting: "#790c06", poison: "#A040A0", ground: "#e5ab0a",
        flying: "#A890F0", psychic: "#F85888", bug: "#74800a", rock: "#675403",
        ghost: "#4b2d56", dragon: "#7038F8", dark: "#2b2624", steel: "#B8B8D0",
        fairy: "#EE99AC", normal: "#A8A878",
    };

    const getCategoryIcon = (category) => {
        if (category === "Physical") return "/icons/move-physical.png";
        if (category === "Special") return "/icons/move-special.png";
        if (category === "Status") return "/icons/move-status.png";
        return null;
    };

    const fetchInfo = async (name, category) => {
        const key = `${category}-${name}`;
        if (cache[key]) return cache[key];

        let info = "";

        if (category === "Moves") {
            const move = moveDataMap[name.toLowerCase()];
            if (move) info = move.effect || "No effect data";
        }

        if (!info) info = name;

        const cleaned = info.replace(/\n|\f/g, " ");

        setCache((prev) => ({ ...prev, [key]: cleaned }));

        return cleaned;
    };

    const loadOverview = async () => {
        if (showOverview) {
            setShowOverview(false);
            return;
        }

        if (!clickedBuild?.pokemon) return;

        const name = clickedBuild.pokemon
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        try {
            const res = await fetch(`/pokemon_overview/${name}.json`);
            const data = await res.json();
            setOverviewData(data);
            setShowOverview(true);
        } catch (err) {
            console.error("Failed to load overview:", err);
        }
    };

    useEffect(() => {
        if (!clickedBuild || !clickedBuild.sourceFile) {
            setBuildData(null);
            return;
        }

        const loadBuild = async () => {
            const text = await loadCSV(MOVESET_PATH + clickedBuild.sourceFile);
            const rows = parseCSV(text);

            const pokemonRows = rows.filter(
                (r) =>
                    normalizePokemonName(r[1]) ===
                    normalizePokemonName(clickedBuild.pokemon)
            );

            const grouped = {};

            for (let row of pokemonRows) {
                const category = row[2];
                if (category === "Spreads") continue;

                const itemName = category === "Stats" ? row[3] : row[4];
                const usage = row[5];

                if (!itemName) continue;

                if (
                    category === "Stats" &&
                    (
                        itemName.toLowerCase().includes("raw count") ||
                        itemName.toLowerCase().includes("viability ceiling") ||
                        itemName.toLowerCase().includes("avg. weight")
                    )
                ) {
                    continue;
                }

                if (!grouped[category]) grouped[category] = [];

                grouped[category].push({ name: itemName, usage });
            }

            Object.keys(grouped).forEach((cat) => {
                grouped[cat] = grouped[cat]
                    .sort((a, b) => Number(b.usage) - Number(a.usage))
                    .slice(0, 5);
            });

            setImgSrc(resolveImage(clickedBuild.display));

            setBuildData({
                display: clickedBuild.display,
                month: clickedBuild.month,
                data: grouped,
            });
        };

        loadBuild();
    }, [clickedBuild, MOVESET_PATH, resolveImage]);

    if (!buildData) {
        return (
            <div style={{ padding: "10px", color: theme.text }}>
                Click a graph point to view build
            </div>
        );
    }

    return (

        <div style={{
            flex: 1,
            minWidth: 0,
            height: "600px",
            overflowY: "auto",
            border: `1px solid ${theme.header}`,
            borderRadius: "10px",
            padding: "12px",
            background: theme.card,
            color: theme.text,
        }}>
            <img
                src={imgSrc}
                alt={buildData.display}
                onError={(e) => handleImgError(e, buildData.display)}
                style={{ width: "110px", display: "block", margin: "0 auto 10px" }}
            />

            <button
                onClick={loadOverview}
                style={{
                    background: "transparent",
                    border: "none",
                    color: theme.text,
                    fontSize: "18px",
                    cursor: "pointer",
                    marginRight: "8px"
                }}
            >
                ⬅
            </button>

            {/*Clickable Pokémon name — opens PokéAPI modal */}
            <h3
                style={{
                    textAlign: "center",
                    cursor: "pointer",
                    textDecoration: "underline dotted",
                    display: "inline-block",
                    width: "100%",
                }}
                title="Click to view Pokémon details"
                onClick={() => setApiModal(buildData.display)}
            >
                {buildData.display} — {buildData.month}
            </h3>

            {showOverview && overviewData ? (

                <div>
                    <h3>Overview</h3>

                    <div
                        dangerouslySetInnerHTML={{
                            __html: overviewData.strategies?.[0]?.overview || "No overview"
                        }}
                    />

                    <h3 style={{ marginTop: "12px" }}>Comments</h3>

                    <div
                        dangerouslySetInnerHTML={{
                            __html: overviewData.strategies?.[0]?.comments || "No comments"
                        }}
                    />
                </div>

            ) : (

                Object.entries(buildData.data).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: "12px" }}>
                        <strong>{category === "Stats" ? "Natures" : category}</strong>

                        <ul style={{ paddingLeft: "18px" }}>
                            {items.map((item, idx) => {
                                const move = moveDataMap[item.name.toLowerCase()];

                                const color =
                                    category === "Moves" && move
                                        ? typeColors[move.type?.toLowerCase()] || theme.text
                                        : theme.text;

                                const iconPath =
                                    category === "Moves" && move
                                        ? getCategoryIcon(move.category)
                                        : null;

                                return (
                                    <li
                                        key={idx}
                                        onMouseEnter={async (e) => {
                                            setTooltip({ text: "Loading...", x: e.clientX, y: e.clientY });
                                            const info = await fetchInfo(item.name, category);
                                            setTooltip({ text: info, x: e.clientX, y: e.clientY });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                        onClick={() => {
                                            if (category === "Teammates") {
                                                onTeammateClick({
                                                    ...clickedBuild,
                                                    pokemon: item.name,
                                                    display: item.name,
                                                });
                                            }
                                        }}
                                        style={{
                                            cursor: category === "Teammates" ? "pointer" : "default",
                                            color,
                                            fontWeight: category === "Moves" ? "bold" : "normal",
                                        }}
                                    >
                                        {iconPath && (
                                            <img
                                                src={iconPath}
                                                alt=""
                                                style={{ height: "16px", marginRight: "6px", verticalAlign: "middle" }}
                                            />
                                        )}
                                        {item.name} ({item.usage}%)
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))

            )}

            {tooltip && (
                <div style={{
                    position: "fixed",
                    top: tooltip.y + 10,
                    left: tooltip.x + 10,
                    background: theme.header,
                    color: theme.text,
                    padding: "8px",
                    borderRadius: "6px",
                    maxWidth: "300px",
                    fontSize: "12px",
                    zIndex: 9999,
                }}>
                    {tooltip.text}
                </div>
            )}

            {apiModal && (
                <PokeAPIModal
                    pokemonName={apiModal}
                    theme={theme}
                    onClose={() => setApiModal(null)}
                />
            )}
        </div>
    );
}
