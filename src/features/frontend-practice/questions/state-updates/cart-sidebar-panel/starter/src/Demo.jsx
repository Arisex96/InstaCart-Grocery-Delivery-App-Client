// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The buttons put sample products in the cart store; your CartPanel must react to them.
import { useState } from "react";
import CartPanel from "./components/CartPanel";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

const sample = [
  ["Add bananas (stock 40)", "p1"],
  ["Add milk (stock 3)", "p2"],
  ["Add dark chocolate (stock 5)", "p9"],
];

export default function Demo() {
  const add_item = useCartStore((s) => s.add_item);
  const clear_cart = useCartStore((s) => s.clear_cart);
  const [continued, setContinued] = useState(0);

  return (
    <div className="mx-auto max-w-sm space-y-3">
      <div className="flex flex-wrap gap-2">
        {sample.map(([label, id]) => (
          <button
            key={id}
            onClick={() => add_item(products.find((p) => p._id === id), 1)}
            className="rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold text-app-text hover:bg-app-cream"
          >
            {label}
          </button>
        ))}
        <button onClick={clear_cart} className="rounded-full px-3 py-1 text-xs text-app-text-light underline">
          Reset store
        </button>
      </div>
      <CartPanel onContinue={() => setContinued((n) => n + 1)} />
      {continued > 0 && <p className="text-xs text-app-text-light">Continue shopping clicked {continued}×</p>}
    </div>
  );
}
