// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch between sample carts to check every state of your OrderSummary.
import { useState } from "react";
import OrderSummary from "./components/OrderSummary";
import { products } from "./data/products";

const line = (id, quantity) => ({ product: products.find((p) => p._id === id), quantity });

const CARTS = {
  "Small cart": [line("p1", 3), line("p2", 1)], // under $50: delivery fee + hint
  "Big cart": [line("p11", 4), line("p12", 2), line("p5", 1)], // over $50: free delivery
  "Empty cart": [],
};

export default function Demo() {
  const [name, setName] = useState("Small cart");
  return (
    <div className="mx-auto max-w-sm space-y-3">
      <div className="flex gap-2">
        {Object.keys(CARTS).map((key) => (
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
      <OrderSummary items={CARTS[name]} />
    </div>
  );
}
