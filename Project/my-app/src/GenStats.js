import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const DATA_PATH = "/pokemon_data/";

export default function GenStats({ compareList, theme }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const [mode, setMode] = useState("average");

    const loadCSV = async (file) => {
        const res = await fetch(file);
        return await res.text();
    };

    const parseCSV = (data) =>
        data.split("\n").slice(1).map((row) => row.split(","));

    const calculateAverages = (data) => {
        let totals = [0, 0, 0, 0, 0, 0];
        let count = 0;

        data.forEach((row) => {
            if (row.length < 11) return;

            for (let i = 0; i < 6; i++) {
                totals[i] += parseInt(row[i + 5]);
            }
            count++;
        });

        return totals.map((val) => val / count);
    };

    useEffect(() => {
        const buildChart = async () => {
            const datasets = [];

            if (mode === "average") {
                for (let gen = 1; gen <= 9; gen++) {
                    const csv = await loadCSV(`${DATA_PATH}pokemon_gen_${gen}.csv`);
                    const parsed = parseCSV(csv);
                    const avg = calculateAverages(parsed);

                    datasets.push({
                        label: `Gen ${gen}`,
                        data: avg,
                    });
                }
            } else {
                const csv = await loadCSV(`${DATA_PATH}pokemon_all.csv`);
                const parsed = parseCSV(csv);

                for (let pkmn of compareList) {
                    const match = parsed.find(
                        (row) =>
                            row[1]?.toLowerCase() === pkmn.display.toLowerCase()
                    );

                    if (!match) continue;

                    datasets.push({
                        label: pkmn.display,
                        data: match.slice(5, 11).map(Number),
                    });
                }
            }

            if (chartRef.current) chartRef.current.destroy();

            chartRef.current = new Chart(canvasRef.current, {
                type: "bar",
                data: {
                    labels: ["HP", "Atk", "Def", "SpA", "SpD", "Spe"],
                    datasets,
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: {
                                color: theme.text,
                            },
                        },
                    },
                    scales: {
                        x: {
                            ticks: { color: theme.text },
                            grid: { color: "#444" },
                        },
                        y: {
                            ticks: { color: theme.text },
                            grid: { color: "#444" },
                        },
                    },
                },
            });
        };

        buildChart();
    }, [compareList, mode, theme]);

    return (
        <div style={{ background: theme.bg, color: theme.text, padding: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    style={{
                        background: theme.card,
                        color: theme.text,
                        padding: "5px",
                        border: "none",
                    }}
                >
                    <option value="average">Gen Average</option>
                    <option value="pokemon">Individual Pokémon</option>
                </select>
            </div>

            <canvas ref={canvasRef}></canvas>
        </div>
    );
}