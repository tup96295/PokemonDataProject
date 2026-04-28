import { useState } from "react";
import ComUsage from "./ComUsage";
import GenStats from "./GenStats";

function App() {
  const [page, setPage] = useState("usage");
  const [darkMode, setDarkMode] = useState(true);

  const theme = darkMode
    ? {
      bg: "#121212",
      text: "#ffffff",
      header: "#1e1e1e",
      card: "#1f1f1f",
      button: "#333",
    }
    : {
      bg: "#f5f5f5",
      text: "#000000",
      header: "#e0e0e0",
      card: "#ffffff",
      button: "#555",
    };

  return (
    <div style={{
      background: theme.bg,
      color: theme.text,
      minHeight: "100vh"
    }}>
      <header style={{
        background: theme.header,
        padding: "15px",
        textAlign: "center"
      }}>
        <h1 style={{ margin: 0 }}>Pokémon Analytics Dashboard</h1>

        <nav style={{ marginTop: "10px" }}>
          <button
            onClick={() => setPage("usage")}
            style={navButtonStyle(page === "usage", theme)}
          >
            Usage (Line)
          </button>

          <button
            onClick={() => setPage("stats")}
            style={navButtonStyle(page === "stats", theme)}
          >
            Stats (Bar)
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            style={navButtonStyle(false, theme)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      </header>

      {/* 🔥 MOVE ICON INFO BAR */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "10px",
        background: theme.card,
        borderBottom: "1px solid #444"
      }}>
        <span>Move Types:</span>
        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <img
            src="/icons/move-physical.png"
            alt=""
            title="Physical: Uses Attack stat and targets opponent's Defense"
            style={{ width: "18px" }}
          />
          Physical
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <img
            src="/icons/move-special.png"
            alt=""
            title="Special: Uses Special Attack stat and targets opponent's Special Defense"
            style={{ width: "18px" }}
          />
          Special
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <img
            src="/icons/move-status.png"
            alt=""
            title="Status: Does not deal direct damage, applies effects like buffs, debuffs, or conditions"
            style={{ width: "18px" }}
          />
          Status
        </span>
      </div>

      <main style={{ padding: "20px" }}>
        {page === "usage" && <ComUsage theme={theme} />}
        {page === "stats" && <GenStats theme={theme} />}
      </main>
    </div>
  );
}

const navButtonStyle = (active, theme) => ({
  margin: "0 10px",
  padding: "8px 15px",
  background: active ? "#4CAF50" : theme.button,
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px"
});

export default App;