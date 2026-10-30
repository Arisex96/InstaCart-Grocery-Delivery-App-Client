// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The cart starts in a bad state (sold-out avocados, 5 milk with only 3 in stock).
// The fake server takes 1.5 s to answer POST /orders so you can watch the pending state.
import { useState } from "react";
import CheckoutSummary from "./components/CheckoutSummary";
import useCartStore from "./store/useCartStore";
import api from "./api/axios";
import { products } from "./data/products";

api.__configure({ latency: 1500 });

// Log every order request so duplicates show up in the Console tab.
const post = api.post;
api.post = (...args) => {
  console.log("POST", args[0], JSON.stringify(args[1]));
  return post(...args);
};

const [bananas, milk, avocados] = products; // milk: stock 3, avocados: stock 0

const seed = (lines) =>
  useCartStore.setState({
    items: lines.map(([product, quantity]) => ({ product, quantity })),
    total_price: lines.reduce((sum, [product, quantity]) => sum + product.price * quantity, 0),
    total_items: lines.reduce((sum, [, quantity]) => sum + quantity, 0),
  });

seed([
  [bananas, 2],
  [milk, 5],
  [avocados, 1],
]);

export default function Demo() {
  const [failNext, setFailNext] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button className="rounded-full border border-app-border bg-white px-3 py-1.5" onClick={() => seed([[bananas, 2], [milk, 1]])}>
          Valid cart
        </button>
        <button className="rounded-full border border-app-border bg-white px-3 py-1.5" onClick={() => seed([[bananas, 2], [milk, 5], [avocados, 1]])}>
          Problem cart
        </button>
        <button className="rounded-full border border-app-border bg-white px-3 py-1.5" onClick={() => seed([])}>
          Empty cart
        </button>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={failNext}
            onChange={(e) => {
              setFailNext(e.target.checked);
              api.__configure({ failNext: e.target.checked ? 1 : 0 });
            }}
          />
          Next order fails
        </label>
      </div>
      <CheckoutSummary />
    </div>
  );
}
