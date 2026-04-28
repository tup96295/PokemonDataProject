const axios = require("axios");
const cheerio = require("cheerio");

const BASE = "https://www.smogon.com/dex";
const generations = ["bw", "xy", "sm", "ss", "sv"];

async function scrapePokemon(pokemon) {
    const results = {};

    for (const gen of generations) {
        const url = `${BASE}/${gen}/pokemon/${pokemon}/`;

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const output = {
                overview: "",
                checks: "",
                builds: []
            };

            // 🔥 OVERVIEW + CHECKS
            $("h2, h3").each((_, el) => {
                const title = $(el).text().trim();

                if (
                    title === "Overview" ||
                    title === "Checks and Counters"
                ) {
                    let content = "";
                    let next = $(el).next();

                    while (next.length && !next.is("h2, h3")) {
                        content += next.text().trim() + "\n";
                        next = next.next();
                    }

                    if (title === "Overview") {
                        output.overview = content.trim();
                    } else {
                        output.checks = content.trim();
                    }
                }
            });

            // 🔥 BUILDS (MOVESSETS)
            $(".Moveset").each((_, el) => {
                const build = {};

                // Name
                build.name = $(el).find(".Moveset-name").text().trim();

                // Moves
                build.moves = [];
                $(el)
                    .find(".Moveset-moves li")
                    .each((_, move) => {
                        build.moves.push($(move).text().trim());
                    });

                // Item
                build.item = $(el)
                    .find(".Moveset-item")
                    .text()
                    .trim();

                // Ability
                build.ability = $(el)
                    .find(".Moveset-ability")
                    .text()
                    .trim();

                // EVs
                build.evs = $(el)
                    .find(".Moveset-evs")
                    .text()
                    .trim();

                // Nature
                build.nature = $(el)
                    .find(".Moveset-nature")
                    .text()
                    .trim();

                if (build.name) {
                    output.builds.push(build);
                }
            });

            if (
                output.overview ||
                output.checks ||
                output.builds.length > 0
            ) {
                results[gen] = output;
            }

        } catch (err) {
            console.log(`❌ Failed: ${gen}`);
        }
    }

    return results;
}

// 🔥 RUN TEST
(async () => {
    const data = await scrapePokemon("incineroar");
    console.log(JSON.stringify(data, null, 2));
})();