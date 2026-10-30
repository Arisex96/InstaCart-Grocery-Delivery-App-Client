// src/components/ProductsPage.jsx — read-only. A slimmed-down Products page that consumes
// useProductFilters (see client/src/pages/Products.tsx for the real one).
import { useLocation } from "react-router-dom";
import { categories } from "../data/products";
import useProductFilters from "../hooks/useProductFilters";

const SORTS = [
  ["default", "Default Features"],
  ["price-low-to-high", "Price: Low to High"],
  ["price-high-to-low", "Price: High to Low"],
  ["rating", "Highest Rated"],
  ["discount", "Biggest Discount"],
  ["name-asc", "Name A–Z"],
];

export default function ProductsPage({ products }) {
  const { filters, setCategory, setSearch, setSortBy, setPriceRange, reset, filtered, hasActiveFilters } =
    useProductFilters(products);
  const { search: queryString } = useLocation();

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-app-cream-dark px-3 py-1.5 font-mono text-xs" data-testid="url">
        URL: /products{queryString}
      </p>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
        {[{ slug: "all", name: "All Products" }, ...categories].map((c) => (
          <button
            key={c.slug}
            aria-pressed={filters.category === c.slug}
            onClick={() => setCategory(c.slug)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
              filters.category === c.slug ? "bg-app-green text-white" : "bg-white text-zinc-700 hover:bg-app-cream"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          aria-label="Search products"
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for groceries..."
          className="rounded-full border border-app-border bg-white px-4 py-2 text-sm"
        />
        <select
          aria-label="Sort by"
          value={filters.sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        >
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          aria-label="Min price"
          placeholder="Min"
          value={filters.minPrice ?? ""}
          onChange={(e) => setPriceRange({ min: e.target.value, max: filters.maxPrice ?? "" })}
          className="w-20 rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        />
        <input
          type="number"
          aria-label="Max price"
          placeholder="Max"
          value={filters.maxPrice ?? ""}
          onChange={(e) => setPriceRange({ min: filters.minPrice ?? "", max: e.target.value })}
          className="w-20 rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={reset}
          disabled={!hasActiveFilters}
          className="rounded-full border border-app-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <p className="text-sm text-app-text-light">
        Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2" aria-label="Results">
        {filtered.map((p) => (
          <li key={p._id} className="flex justify-between rounded-xl border border-app-border bg-white px-4 py-2 text-sm">
            <span>{p.name}</span>
            <span className="font-semibold text-app-green">${p.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="text-sm text-app-text-light">No products match</p>}
    </div>
  );
}
