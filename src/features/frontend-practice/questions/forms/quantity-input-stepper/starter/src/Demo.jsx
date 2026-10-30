// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Pick a product to try your QuantityInput against different stock levels.
import { useState } from "react";
import QuantityInput from "./components/QuantityInput";
import { products } from "./data/products";

const CHOICES = [products[0], products[1], products[8]]; // bananas (40), milk (3), chocolate (5)

function Line({ product }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="space-y-3 rounded-2xl border border-app-border bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-app-text">{product.name}</span>
        <span className="text-xs text-app-text-light">stock {product.stock}</span>
      </div>
      <QuantityInput value={qty} onChange={setQty} min={1} max={product.stock} />
      <p className="text-sm text-app-text-light">
        Parent state: <b className="text-app-green">{qty}</b> × ${product.price.toFixed(2)} ={" "}
        <b className="text-app-green">${(qty * product.price).toFixed(2)}</b>
      </p>
    </div>
  );
}

export default function Demo() {
  const [id, setId] = useState(CHOICES[1]._id);
  const product = CHOICES.find((p) => p._id === id);
  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="flex flex-wrap gap-2">
        {CHOICES.map((p) => (
          <button
            key={p._id}
            onClick={() => setId(p._id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              p._id === id ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      {/* key: a fresh quantity (1) when switching product */}
      <Line key={product._id} product={product} />
    </div>
  );
}
