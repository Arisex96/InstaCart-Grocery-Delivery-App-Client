// src/Demo.jsx: read-only. The live preview renders this file's default export.
// Switch products to check discount, low stock, sold out and a missing description.
// onAdd is wired to the Console tab.
import { useState } from "react";
import ProductDetailPanel from "./components/ProductDetailPanel";
import { products } from "./data/products";

const art = (symbol, bg) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="' +
      bg +
      '"/><text x="50" y="68" font-size="54" text-anchor="middle">' +
      symbol +
      "</text></svg>",
  );

const IMAGES = {
  p1: [art("🍌", "#fef9c3"), art("🍌🍌", "#ecfccb"), art("🌿", "#dcfce7")],
  p2: [art("🥛", "#e0f2fe"), art("🐄", "#f1f5f9"), art("🧊", "#e0e7ff")],
  p3: [art("🥑", "#dcfce7"), art("🥑🥑", "#ecfccb"), art("🔪", "#f1f5f9")],
  p12: [art("🫒", "#ecfccb")],
};

const REVIEWS = {
  p1: [
    { _id: "r1", name: "Priya", rating: 5, comment: "Perfectly ripe every time." },
    { _id: "r2", name: "Marcus", rating: 4, comment: "A little green on arrival, great two days later." },
  ],
  p2: [{ _id: "r3", name: "Lena", rating: 5, comment: "Fresh and cold." }],
};

const CHOICES = [
  ["Bananas", "p1"],
  ["Milk (3 left)", "p2"],
  ["Avocados (sold out)", "p3"],
  ["Olive oil (no description)", "p12"],
];

export default function Demo() {
  const [id, setId] = useState("p1");
  const product = products.find((p) => p._id === id);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {CHOICES.map(([label, value]) => (
          <button
            key={value}
            onClick={() => setId(value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              value === id ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <ProductDetailPanel
        product={product}
        images={IMAGES[id] ?? []}
        reviews={REVIEWS[id] ?? []}
        onAdd={(p, quantity) => console.log("onAdd", p.name, "x", quantity)}
      />
    </div>
  );
}
