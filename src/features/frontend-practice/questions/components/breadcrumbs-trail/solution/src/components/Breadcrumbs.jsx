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

  // ROOT CAUSE (crash): `find(...)` returns undefined for a slug the catalogue no longer has, and
  // reading `.name` of undefined throws during render.
  // FIX: optional chaining, with the raw slug as the fallback label.
  const displayCategoryLabel =
    activeCategoryLabel ||
    (activeCategory === "all" ? "All Products" : (categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory));

  // ROOT CAUSE (odd URL): "all" is a UI default, not a category the filters understand.
  // FIX: only add the query string for a real category.
  const handleCategoryClick = () => {
    navigate(activeCategory && activeCategory !== "all" ? "/products?category=" + activeCategory : "/products");
  };

  return (
    // ROOT CAUSE (a11y): a div has no landmark role. FIX: <nav> with a name, so a page with
    // several navigation regions (header, footer, trail) lets screen reader users tell them apart.
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 py-2.5 px-4 rounded-xl border border-app-border w-fit">
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
          {/* FIX: the current page is not an action. Plain text + aria-current="page". */}
          <span aria-current="page" className="text-zinc-800 font-semibold">
            {activeProductName}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;
