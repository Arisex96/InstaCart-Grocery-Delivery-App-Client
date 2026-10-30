// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The fake server is set to fail the very first request, like a bad mobile connection.
// Changing the category afterwards sends a second request that succeeds.
import { useState } from "react";
import ProductListing from "./components/ProductListing";
import useCartStore from "./store/useCartStore";
import api from "./api/axios";
import { categories } from "./data/products";

api.__configure({ failNext: 1 });

export default function Demo() {
  const [category, setCategory] = useState("all");
  const lines = useCartStore((state) => state.items.length);
  const units = useCartStore((state) => state.total_items);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        >
          <option value="all">All products</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-app-text-light">
          Cart lines: <b className="text-app-green">{lines}</b> · items: <b className="text-app-green">{units}</b>
        </p>
      </div>
      <ProductListing category={category} />
    </div>
  );
}
