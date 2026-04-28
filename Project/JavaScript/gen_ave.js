let chart;

// Load CSV
async function loadCSV(file) {
    const response = await fetch(file);
    return await response.text();
}

// Parse CSV
function parseCSV(data) {
    const rows = data.split("\n").slice(1);
    return rows.map(row => row.split(","));
}

// Calculate averages
function calculateAverages(data) {
    let totals = {
        HP: 0,
        Attack: 0,
        Defense: 0,
        SpAtk: 0,
        SpDef: 0,
        Speed: 0
    };

    let count = 0;

    data.forEach(row => {
        if (row.length < 11) return;

        totals.HP += parseInt(row[5]);
        totals.Attack += parseInt(row[6]);
        totals.Defense += parseInt(row[7]);
        totals.SpAtk += parseInt(row[8]);
        totals.SpDef += parseInt(row[9]);
        totals.Speed += parseInt(row[10]);

        count++;
    });

    return [
        totals.HP / count,
        totals.Attack / count,
        totals.Defense / count,
        totals.SpAtk / count,
        totals.SpDef / count,
        totals.Speed / count
    ];
}

// Get selected generations
function getSelectedGenerations() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    return Array.from(checkboxes).map(cb => cb.value);
}

// Main update function
async function updateChart() {
    const gens = getSelectedGenerations();

    const datasets = [];

    for (let gen of gens) {
        const csv = await loadCSV(`pokemon_data/pokemon_gen_${gen}.csv`);
        const parsed = parseCSV(csv);
        const avg = calculateAverages(parsed);

        datasets.push({
            label: `Gen ${gen}`,
            data: avg
        });
    }

    const ctx = document.getElementById('statsChart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['HP', 'Attack', 'Defense', 'SpAtk', 'SpDef', 'Speed'],
            datasets: datasets
        },
        options: {
            responsive: true,
            animation: {
                duration: 1200,
                easing: 'easeOutBounce'
            },
            transitions: {
                active: {
                    animation: {
                        duration: 800
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Auto-update when checkbox changes
    document.querySelectorAll("input[type=checkbox]").forEach(cb => {
        cb.addEventListener("change", updateChart);
    });
}

// Initial load
updateChart();