// src/components/PaginatedProducts.jsx — Products page grid with a search box, a "per page"
// selector and pagination controls (modelled on client/src/pages/Products.tsx + ProductGrid.tsx).
//
// Also reported by an accessibility audit: the footer controls cannot be operated with a screen reader.
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import usePagination from "../hooks/usePagination";

const PAGE_SIZES = [4, 5, 6, 12];

const PaginatedProducts = ({ products, initialPageSize = 6 }) => {
  const [query, setQuery] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()));

  const { page, pageSize, totalPages, pageItems, start, setPageSize, next, prev, canNext, canPrev } = usePagination(
    filtered,
    { initialPageSize, resetKey: query },
  );

  const from = filtered.length === 0 ? 0 : start + 1;
  const to = Math.min(start + pageSize, filtered.length);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for groceries..."
          className="rounded-full border border-app-border bg-white px-4 py-2 text-sm"
        />
        <select
          aria-label="Products per page"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
        <p className="text-sm text-app-text-light">
          Showing {from}–{to} of {filtered.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center text-app-text-light">
          No products match your search
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* FIX (accessibility): a landmark for the group, accessible names for the icon-only buttons,
          and a polite live region so "Page 2 of 3" is announced when it changes. */}
      <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
        <button
          onClick={prev}
          disabled={!canPrev}
          aria-label="Previous page"
          className="rounded-full border border-app-border bg-white p-2 disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span aria-live="polite" className="text-sm font-medium text-app-green">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={next}
          disabled={!canNext}
          aria-label="Next page"
          className="rounded-full border border-app-border bg-white p-2 disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </section>
  );
};

export default PaginatedProducts;
