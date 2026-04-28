export const normalizePokemonName = (name) => {
    if (!name) return "";

    const raw = name.toLowerCase();
    const n = raw.trim();

    // Indeedee
    if (n.includes("indeedee")) {
        if (n.includes("female") || n.includes("-f"))
            return "indeedeef";
        if (n.includes("male") || n.includes("-m"))
            return "indeedeem";
        return "indeedee";
    }

    if (n.includes("nidoran")) {
        if (n.includes("female") || n.includes("-f"))
            return "nidoranf";
        if (n.includes("male") || n.includes("-m"))
            return "nidoranm";
        return "nidoran";
    }

    // Ogerpon
    if (n.includes("ogerpon")) {
        if (n.includes("wellspring")) return "ogerponwellspring";
        if (n.includes("hearthflame")) return "ogerponhearthflame";
        if (n.includes("cornerstone")) return "ogerponcornerstone";
        return "ogerpon";
    }

    // Urshifu
    if (n.includes("urshifu")) {
        if (n.includes("rapid")) return "urshifurapidstrike";
        if (n.includes("single")) return "urshifusinglestrike";
        return "urshifu";
    }

    // Therian forms
    if (n.includes("therian")) {
        return n.replace(/[^a-z0-9]/g, "");
    }

    // default
    return n.replace(/[^a-z0-9]/g, "");
};