// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch the catalogue to check every state of your CategoryChipBar.
import { useState } from "react";
import CategoryChipBar from "./components/CategoryChipBar";
import { categories, products } from "./data/products";

// A category that currently has no products at all.
const ALL_CATEGORIES = [...categories, { slug: "frozen-foods", name: "Frozen Foods" }];

const CATALOGUES = {
  "Full catalogue": products,
  "Bakery & snacks only": products.filter((p) => p.category === "bakery" || p.category === "snacks"),
  "No products": [],
};

export default function Demo() {
  const [catalogue, setCatalogue] = useState("Full catalogue");
  const [active, setActive] = useState("all");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(CATALOGUES).map((name) => (
          <button
            key={name}
            onClick={() => setCatalogue(name)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              name === catalogue ? "border-app-orange bg-app-orange text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <CategoryChipBar categories={ALL_CATEGORIES} products={CATALOGUES[catalogue]} active={active} onChange={setActive} />

      <p className="text-sm text-app-text-light">
        Active: <span className="font-semibold text-app-green">{active}</span>
      </p>
    </div>
  );
}
