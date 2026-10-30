// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Same controls as the Products page: category, search, price range, sort. The number inputs are
// parsed with parseFloat, so an empty box becomes NaN (exactly what the real page passes down).
import { useState } from "react";
import { filterProducts } from "./lib/filterProducts";
import ProductCard from "./components/ProductCard";
import { products, categories } from "./data/products";

export default function Demo() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [limit, setLimit] = useState(0);

  const visible = filterProducts(products, {
    category,
    searchQuery: search,
    minPrice: parseFloat(min),
    maxPrice: parseFloat(max),
    sortBy,
    limit,
  });

  const field = "rounded-xl border border-app-border bg-white px-3 py-2 text-sm";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={field} />
        <input type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min $" className={`${field} w-24`} />
        <input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max $" className={`${field} w-24`} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={field}>
          <option value="">Default order</option>
          <option value="price-low-to-high">Price: Low to High</option>
          <option value="price-high-to-low">Price: High to Low</option>
          <option value="rating">Highest rated</option>
          <option value="discount">Biggest discount</option>
          <option value="name-asc">Name A–Z</option>
        </select>
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={field}>
          <option value={0}>No limit</option>
          <option value={3}>Featured (3)</option>
        </select>
      </div>

      <p className="text-sm text-app-text-light">
        {visible.length} results · Catalogue starts with: <b>{products[0].name}</b> (must never change)
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
