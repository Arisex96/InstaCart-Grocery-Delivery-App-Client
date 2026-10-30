// src/Demo.jsx — read-only. The "Reorder" drawer next to the order history it was copied from.
import { useState } from "react";
import MiniCart from "./components/MiniCart";
import { products } from "./data/products";

// The previous order, exactly as the order history page holds it.
const previousOrder = [
  { product: products[0], quantity: 1 },
  { product: products[1], quantity: 2 },
  { product: products[4], quantity: 1 },
];

export default function Demo() {
  const [, setTick] = useState(0);

  return (
    <div className="space-y-3">
      <MiniCart initialItems={previousOrder} />
      <button
        onClick={() => setTick((t) => t + 1)}
        className="rounded-full border border-app-border bg-white px-3 py-1 text-sm"
      >
        Re-render drawer
      </button>
      <div className="max-w-md rounded-2xl bg-app-cream-dark p-3 text-sm">
        <p className="font-semibold">Previous order (order history)</p>
        <ul>
          {previousOrder.map((it) => (
            <li key={it.product._id}>
              {it.quantity} × {it.product.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
