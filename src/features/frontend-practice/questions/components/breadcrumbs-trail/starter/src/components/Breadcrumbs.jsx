// src/components/Breadcrumbs.jsx — trimmed copy of client/src/components/Breadcrums.tsx.
// Shown above the product grid (Products page) and above the product details (ProductPage).
//
// Props
//   activeCategory       slug such as "bakery", or "all" (default)
//   activeCategoryLabel  optional label that overrides the catalogue lookup
//   activeProductName    when set, the trail ends with the product being viewed
//
// Reported problems: a white screen for products from a retired category, a strange URL from the
// "All Products" crumb, and a poor screen reader experience (accessibility audit, ticket A11Y-212).
import { MapPinIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categories } from "../data/products";

const Breadcrumbs = ({ activeCategory = "all", activeCategoryLabel, activeProductName }) => {
  const navigate = useNavigate();

  const displayCategoryLabel =
    activeCategoryLabel ||
    (activeCategory === "all" ? "All Products" : categories.find((c) => c.slug === activeCategory).name);

  const handleCategoryClick = () => {
    navigate("/products?category=" + activeCategory);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 py-2.5 px-4 rounded-xl border border-app-border w-fit">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 hover:text-app-green font-medium transition-colors cursor-pointer"
      >
        <MapPinIcon className="size-4" />
        Home
      </button>
      <span className="text-zinc-300">/</span>
      <button
        onClick={handleCategoryClick}
        className="text-zinc-800 font-semibold cursor-pointer hover:bg-app-cream px-2 py-0.5 rounded-lg transition-colors border-none bg-transparent"
      >
        {displayCategoryLabel}
      </button>
      {activeProductName && (
        <>
          <span className="text-zinc-300">/</span>
          <button className="text-zinc-800 font-semibold border-none bg-transparent">{activeProductName}</button>
        </>
      )}
    </div>
  );
};

export default Breadcrumbs;
