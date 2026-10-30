// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Pick how the fake server behaves, type in the search box and watch the dropdown.
import { useState } from "react";
import SearchSuggestions from "./components/SearchSuggestions";
import api from "./api/axios";

function applyScenario(name) {
  api.__reset();
  if (name === "Slow") api.__configure({ latency: 1500 });
  if (name === "Failing") api.__configure({ failNext: 1000 });
  if (name === "Fast") api.__configure({ latency: 60 });
}

export default function Demo() {
  const [scenario, setScenario] = useState("Fast");
  const [picked, setPicked] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-app-text-light">Fake server:</span>
        {["Fast", "Slow", "Failing"].map((name) => (
          <button
            key={name}
            onClick={() => {
              applyScenario(name);
              setScenario(name);
            }}
            className={`rounded-full border px-3 py-1 font-semibold ${
              name === scenario ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <SearchSuggestions onSelect={setPicked} />

      <p className="text-sm text-app-text-light">
        Picked product:{" "}
        <span className="font-semibold text-app-green">{picked ? `${picked.name} ($${picked.price.toFixed(2)})` : "none yet"}</span>
      </p>
    </div>
  );
}
