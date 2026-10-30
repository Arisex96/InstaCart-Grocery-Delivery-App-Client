// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The buttons change how the fake server behaves, so you can check every state of your listing.
import { useState } from "react";
import ProductsListing from "./components/ProductsListing";
import api from "./api/axios";

const realGet = api.get;

function applyScenario(name) {
  api.__reset();
  api.get = realGet;
  if (name === "Slow") api.__configure({ latency: 2500 });
  if (name === "Failing") api.__configure({ failNext: 1, latency: 400 }); // first request fails, Retry works
  if (name === "Empty") {
    api.get = async () => {
      await new Promise((r) => setTimeout(r, 400));
      return { data: { products: [] } };
    };
  }
}

const SCENARIOS = ["Normal", "Slow", "Failing", "Empty"];

export default function Demo() {
  const [scenario, setScenario] = useState("Normal");
  const [run, setRun] = useState(0);

  const choose = (name) => {
    applyScenario(name);
    setScenario(name);
    setRun((n) => n + 1); // remount so the listing loads again under the new scenario
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-app-text-light">Fake server:</span>
        {SCENARIOS.map((name) => (
          <button
            key={name}
            onClick={() => choose(name)}
            className={`rounded-full border px-3 py-1 font-semibold ${
              name === scenario ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <ProductsListing key={run} />
    </div>
  );
}
