import React, { useMemo } from "react";
import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";
import ProductCard from "./ProductCard";
import { Inbox } from "lucide-react";

export interface ProductGridProps {
  products?: Product[];
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: string;
  searchQuery?: string;
  limit?: number;
  onResetFilters?: () => void;
  scrollable?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products = dummyProducts,
  category = null,
  minPrice = null,
  maxPrice = null,
  sortBy = "",
  searchQuery = "",
  limit,
  onResetFilters,
  scrollable = false,
}) => {
  // Apply filtering and sorting using useMemo for performance optimization
  const processedProducts = useMemo(() => {
    let list = [...products];

    // 1. Filter by category
    if (category && category !== "all") {
      list = list.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase(),
      );
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      // `description` is nullable server-side; guard rather than assume a
      // string, so a product without one cannot break search.
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description ?? "").toLowerCase().includes(query),
      );
    }

    // 3. Filter by Price Range
    if (minPrice !== null && minPrice !== undefined && !isNaN(minPrice)) {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null && maxPrice !== undefined && !isNaN(maxPrice)) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    // 4. Sorting
    if (sortBy) {
      if (sortBy === "price-low-to-high") {
        list.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-high-to-low") {
        list.sort((a, b) => b.price - a.price);
      } else if (sortBy === "rating") {
        list.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === "discount") {
        list.sort((a, b) => b.discount - a.discount);
      } else if (sortBy === "name-asc") {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    // 5. Limit slicing (e.g. for featured products section on Home page)
    if (limit && limit > 0) {
      list = list.slice(0, limit);
    }

    return list;
  }, [products, category, minPrice, maxPrice, sortBy, searchQuery, limit]);

  if (processedProducts.length === 0) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
        <Inbox className="size-16 text-gray-400 mb-4 animate-bounce-soft" />
        <h3 className="text-xl font-bold text-app-green font-serif mb-2">
          No Products Found
        </h3>
        <p className="text-sm text-zinc-550 max-w-md mb-6">
          We couldn't matching items for your active filters. Try adjusting your
          price range, choosing another category, or clearing the filters.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="bg-app-green hover:bg-app-green-light text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  const gridStyle = scrollable
    ? " lg:h-[650px] lg:overflow-y-auto pr-2 pb-6"
    : "";

  return (
    <div className={gridStyle}>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {processedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
