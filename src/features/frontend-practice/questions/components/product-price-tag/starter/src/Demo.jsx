// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch between sample products to check every state of your PriceTag.
import { useState } from "react";
import PriceTag from "./components/PriceTag";
import { products } from "./data/products";

const byId = (id) => products.find((p) => p._id === id);

const SCENARIOS = {
  Regular: byId("p1"), // $1.20, 1 lb
  "On sale": byId("p2"), // $3.50 was $4.40, 20% off, 1 gal
  "Multi-pack": byId("p6"), // $4.99 was $5.99, 12 pk -> per unit
  "Free sample": { ...byId("p8"), price: 0, originalPrice: 3, discount: 100 },
  "Bad data": { ...byId("p4"), originalPrice: 2.0, discount: 10 }, // "discount" but not cheaper
};

export default function Demo() {
  const [name, setName] = useState("On sale");
  const product = SCENARIOS[name];
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(SCENARIOS).map((key) => (
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
      <div className="rounded-2xl border border-app-border bg-white p-4">
        <p className="mb-2 font-bold text-app-text">{product.name}</p>
        <PriceTag product={product} />
      </div>
    </div>
  );
}
