// src/components/Shop.jsx — read-only. The page shell: owns the search box (local state) and wraps the
// badge and the rows in the CartProvider. `onRender` lets tests and the demo count renders.
import { useState } from "react";
import { CartProvider } from "../context/CartContext";
import CartBadge from "./CartBadge";
import ProductRow from "./ProductRow";

export default function Shop({ products, onRender }) {
  const [query, setQuery] = useState("");

  return (
    <CartProvider>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <label htmlFor="shop-search" className="sr-only">
            Search the shop
          </label>
          <input
            id="shop-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for groceries..."
            className="flex-1 rounded-full border border-app-border bg-white px-4 py-2 text-sm"
          />
          <CartBadge onRender={onRender} />
        </div>
        <ul className="space-y-2">
          {products.map((product) => (
            <ProductRow key={product._id} product={product} onRender={onRender} />
          ))}
        </ul>
      </div>
    </CartProvider>
  );
}
