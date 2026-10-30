// src/Demo.jsx — read-only. The live preview renders this file's default export.
// "Products page" passes filters and a reset handler; "Featured row" passes neither.
import { useState } from "react";
import ProductGrid from "./components/ProductGrid";
import { products, categories } from "./data/products";

export default function Demo() {
  const [mode, setMode] = useState("page");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("no-such-item");

  const reset = () => {
    setCategory("all");
    setSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="rounded-xl border border-app-border bg-white px-3 py-2">
          <option value="page">Products page (with reset handler)</option>
          <option value="featured">Featured row (no reset handler)</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-app-border bg-white px-3 py-2">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="rounded-xl border border-app-border bg-white px-3 py-2"
        />
      </div>
      <ProductGrid
        products={products}
        category={category}
        searchQuery={search}
        onResetFilters={mode === "page" ? reset : undefined}
      />
    </div>
  );
}
