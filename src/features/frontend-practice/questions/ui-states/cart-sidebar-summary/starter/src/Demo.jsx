// src/Demo.jsx — read-only. The live preview renders this file's default export.
// It keeps a tiny cart in local state and feeds it to your CartSummary.
import { useState } from "react";
import CartSummary from "./components/CartSummary";
import { products } from "./data/products";

const [bananas, milk] = products;

export default function Demo() {
  const [items, setItems] = useState([]);
  const [lastAction, setLastAction] = useState("nothing yet");

  const add = (product) =>
    setItems((current) => {
      const found = current.find((it) => it.product._id === product._id);
      return found
        ? current.map((it) => (it.product._id === product._id ? { ...it, quantity: it.quantity + 1 } : it))
        : [...current, { product, quantity: 1 }];
    });

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-2">
        <button className="rounded-full bg-app-orange px-4 py-2 text-sm font-semibold text-white" onClick={() => add(bananas)}>
          Add bananas
        </button>
        <button className="rounded-full bg-app-orange px-4 py-2 text-sm font-semibold text-white" onClick={() => add(milk)}>
          Add milk
        </button>
        <button className="rounded-full border border-app-border bg-white px-4 py-2 text-sm" onClick={() => setItems([])}>
          Clear cart
        </button>
        <p className="text-xs text-app-text-light">Last action: {lastAction}</p>
      </div>
      <CartSummary items={items} onCheckout={() => setLastAction("checkout pressed")} />
    </div>
  );
}
