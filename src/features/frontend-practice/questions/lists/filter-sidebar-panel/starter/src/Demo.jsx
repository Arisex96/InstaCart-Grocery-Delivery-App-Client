// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch the catalogue to check your ProductBrowser with different data.
import { useState } from "react";
import ProductBrowser from "./components/ProductBrowser";
import { products, categories } from "./data/products";

const CATALOGUES = {
  "All 12 products": products,
  "Five products": products.slice(0, 5),
  "Empty catalogue": [],
};

export default function Demo() {
  const [name, setName] = useState("All 12 products");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Object.keys(CATALOGUES).map((key) => (
          <button
            key={key}
            onClick={() => setName(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              key === name ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      {/* key: start from fresh filters whenever the catalogue changes */}
      <ProductBrowser key={name} products={CATALOGUES[name]} categories={categories} />
    </div>
  );
}
