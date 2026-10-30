// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The fake server is slow (1.2 s) and its FIRST request fails, so you can watch the loading
// and error paths. Use the category buttons to trigger more requests.
import { useState } from "react";
import ProductsPage from "./pages/ProductsPage";
import api from "./api/axios";
import { categories } from "./data/products";

api.__configure({ latency: 1200, failNext: 1 });

export default function Demo() {
  const [category, setCategory] = useState("all");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[{ slug: "all", name: "All" }, ...categories].map((c) => (
          <button
            key={c.slug}
            onClick={() => setCategory(c.slug)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              category === c.slug ? "bg-app-green text-white" : "border border-app-border bg-white text-app-text"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <ProductsPage category={category} />
    </div>
  );
}
