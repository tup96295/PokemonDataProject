import React, {
    useEffect,
    useRef,
    useCallback,
    useState,
} from "react";
import Chart from "chart.js/auto";
import { normalizePokemonName } from "./normalizePokemon";

const getUsagePath = (battleMode) =>
    battleMode === "singles"
        ? process.env.PUBLIC_URL + "/singles/smogon_csv/"
        : process.env.PUBLIC_URL + "/doubles/smogon_csv/";

export default function UsageGraph({
    compareList,
    selectedGen,
    battleMode,
    onPointClick,
    theme
}) {
    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    const [usageFiles, setUsageFiles] = useState([]);

    const USAGE_PATH = getUsagePath(battleMode);

    const getPokemonColor = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash =
                name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360},70%,50%)`;
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

    const extractMonth = (filename) => {
        const match = filename.match(/\d{4}-\d{2}/);
        return match ? match[0] : null;
    };

    useEffect(() => {
        fetch(USAGE_PATH + "files.json")
            .then((res) => res.json())
            .then((data) => setUsageFiles(data.files));
    }, [battleMode, USAGE_PATH]);

    const getUsageData = useCallback(async () => {
        const sortedFiles = usageFiles
            .filter((f) =>
                f.toLowerCase().includes(`_gen${selectedGen}`)
            )
            .sort();

        const labels = sortedFiles.map((f) =>
            extractMonth(f)
        );

        const fileData = await Promise.all(
            sortedFiles.map(async (file) => {
                const text = await loadCSV(
                    USAGE_PATH + file
                );
                return parseCSV(text);
            })
        );

        const datasets = [];

        for (let pokemonObj of compareList) {
            const data = [];

            for (let rows of fileData) {
                const match = rows.find(
                    (r) =>
                        normalizePokemonName(r[1]) ===
                        normalizePokemonName(
                            pokemonObj.display
                        )
                );

                data.push(
                    match && match[2]
                        ? Number(match[2])
                        : 0
                );
            }

            datasets.push({
                label: pokemonObj.display,
                data,
                borderColor: getPokemonColor(
                    pokemonObj.display
                ),
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 6,
            });
        }

        return { labels, datasets, sortedFiles };
    }, [
        usageFiles,
        compareList,
        selectedGen,
        USAGE_PATH,
    ]);

    useEffect(() => {
        if (!compareList.length || !canvasRef.current) {
            if (chartRef.current) chartRef.current.destroy();
            return;
        }

        const buildChart = async () => {
            const { labels, datasets, sortedFiles } =
                await getUsageData();

            if (chartRef.current) chartRef.current.destroy();

            chartRef.current = new Chart(canvasRef.current, {
                type: "line",
                data: { labels, datasets },
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

                    onClick: (evt) => {
                        const points =
                            chartRef.current.getElementsAtEventForMode(
                                evt,
                                "nearest",
                                { intersect: false },
                                true
                            );

                        if (!points.length) return;

                        const point = points[0];

                        onPointClick({
                            pokemon:
                                compareList[
                                    point.datasetIndex
                                ].display,
                            display:
                                compareList[
                                    point.datasetIndex
                                ].display,
                            month: labels[point.index],
                            sourceFile:
                                sortedFiles[point.index],
                        });
                    },
                },
            });
        };

        buildChart();
    }, [compareList, getUsageData, theme]);

    return <canvas ref={canvasRef}></canvas>;
}