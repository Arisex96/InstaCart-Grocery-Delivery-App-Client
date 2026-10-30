// src/Demo.jsx — read-only. The live preview renders this file's default export.
import { useState } from "react";
import CartItemList from "./components/CartItemList";
import { products } from "./data/products";

const initial = [products[0], products[1], products[4], products[6]].map((product) => ({ product, quantity: 1 }));

export default function Demo() {
  const [items, setItems] = useState(initial);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">
        <button className="rounded-full border border-app-border bg-white px-3 py-1.5" onClick={() => setItems((list) => [...list].reverse())}>
          Reverse order
        </button>
        <button className="rounded-full border border-app-border bg-white px-3 py-1.5" onClick={() => setItems(initial)}>
          Restore items
        </button>
      </div>
      <CartItemList items={items} onRemove={(id) => setItems((list) => list.filter((it) => it.product._id !== id))} />
    </div>
  );
}
