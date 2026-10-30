// src/components/ProductGrid.jsx — trimmed copy of client/src/components/ProductGrid.tsx.
// Used by the Products page (with filters + onResetFilters) and by the home page
// "Featured" row (no filters, no reset handler).
//
// Reported: the Products page shows a blank area for searches with no matches, and
// the Featured row crashes when its (unwanted) reset button is clicked.
import { useMemo } from "react";
import { Inbox } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [], category = null, searchQuery = "", maxPrice = null, onResetFilters }) => {
  const processedProducts = useMemo(() => {
    let list = [...products];

    if (category && category !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(query) || (p.description ?? "").toLowerCase().includes(query),
      );
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      list = list.filter((p) => p.price <= maxPrice);
    }
    return list;
  }, [products, category, searchQuery, maxPrice]);

  // Empty state: shown when there is nothing to list.
  if (products.length === 0) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl border border-dashed border-gray-300">
        <Inbox className="size-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-app-green font-serif mb-2">No Products Found</h3>
        <p className="text-sm text-zinc-500 max-w-md mb-6">
          We couldn't find matching items for your active filters. Try adjusting your price range, choosing another
          category, or clearing the filters.
        </p>
        <button
          onClick={() => onResetFilters()}
          className="bg-app-green hover:bg-app-green-light text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {processedProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
