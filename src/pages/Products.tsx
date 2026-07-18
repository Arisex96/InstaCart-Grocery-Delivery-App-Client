import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { dummyProducts, categoriesData } from "../assets/assets";
import ProductGrid from "../components/ProductGrid";
import Breadcrumbs from "../components/Breadcrums";

// ==========================================
// Sub-Components Definitions (Same Page)
// ==========================================

interface ProductHeaderProps {
  filteredCount: number;
  onOpenMobileFilters: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  filteredCount,
  onOpenMobileFilters,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "default";
  const activeCategoryLabel =
    categoriesData.find((c) => c.slug === activeCategory)?.name ||
    "All Products";
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-app-border">
      <div>
        <h1 className="text-3xl font-serif text-app-green font-bold flex items-center gap-2">
          {activeCategoryLabel}
        </h1>
        <p className="text-sm text-zinc-550 mt-1">
          Showing {filteredCount} {filteredCount === 1 ? "result" : "results"}
          {searchQuery && (
            <span>
              {" "}
              for "
              <span className="font-semibold text-app-orange">
                {searchQuery}
              </span>
              "
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-550 font-medium whitespace-nowrap hidden sm:inline">
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) =>
              navigate(
                `/products?category=${activeCategory}&sortBy=${e.target.value}`,
              )
            }
            className="border border-app-border rounded-xl px-3 py-2 text-sm text-zinc-700 bg-white focus:outline-none focus:border-app-green focus:ring-2 focus:ring-app-green/10 cursor-pointer shadow-sm"
          >
            <option value="default">Default Features</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-2 border border-app-border bg-white rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-app-cream/35 transition-colors shadow-sm cursor-pointer"
        >
          <SlidersHorizontal className="size-4 text-app-green" />
          Filters
        </button>
      </div>
    </div>
  );
};

interface SidebarFiltersProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  minPriceInput: string;
  onMinPriceChange: (val: string) => void;
  maxPriceInput: string;
  onMaxPriceChange: (val: string) => void;
  onResetFilters: () => void;
  showResetButton: boolean;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  activeCategory,
  onCategoryChange,
  minPriceInput,
  onMinPriceChange,
  maxPriceInput,
  onMaxPriceChange,
  onResetFilters,
  showResetButton,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-1/4 gap-6 shrink-0 sticky top-24 self-start">
      {/* Categories Card */}
      <div className="bg-white rounded-2xl border border-app-border p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-app-green text-md tracking-wide uppercase border-b border-app-border pb-2.5">
          Categories
        </h3>
        <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange("all")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 font-medium ${
              activeCategory === "all"
                ? "bg-app-green text-white shadow-sm font-semibold"
                : "hover:bg-app-cream hover:text-app-green text-zinc-650"
            }`}
          >
            All Products
          </button>
          {categoriesData.map((category) => (
            <button
              key={category.slug}
              onClick={() => onCategoryChange(category.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 font-medium ${
                activeCategory === category.slug
                  ? "bg-app-green text-white shadow-sm font-semibold"
                  : "hover:bg-app-cream hover:text-app-green text-zinc-650"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Card */}
      <div className="bg-white rounded-2xl border border-app-border p-6 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-app-green text-md tracking-wide uppercase border-b border-app-border pb-2.5">
          Price Range
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-full border border-app-border rounded-xl pl-6 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-app-green focus:ring-2 focus:ring-app-green/10"
              />
            </div>
            <span className="text-zinc-400 font-bold">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-zinc-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-full border border-app-border rounded-xl pl-6 pr-3 py-2 text-sm bg-white focus:outline-none focus:border-app-green focus:ring-2 focus:ring-app-green/10"
              />
            </div>
          </div>
          {showResetButton && (
            <button
              onClick={onResetFilters}
              className="text-xs text-app-orange hover:text-app-orange-dark font-semibold text-center hover:underline cursor-pointer pt-1"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

interface MobileCategoryScrollerProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

const MobileCategoryScroller: React.FC<MobileCategoryScrollerProps> = ({
  activeCategory,
  onCategoryChange,
}) => (
  <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-1">
    <div className="flex gap-2.5 w-max font-sans">
      <button
        onClick={() => onCategoryChange("all")}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
          activeCategory === "all"
            ? "bg-app-green text-white shadow-md font-bold"
            : "bg-white border border-app-border text-zinc-700 hover:bg-app-cream"
        }`}
      >
        All Products
      </button>
      {categoriesData.map((category) => (
        <button
          key={category.slug}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === category.slug
              ? "bg-app-green text-white shadow-md font-bold"
              : "bg-white border border-app-border text-zinc-700 hover:bg-app-cream"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  </div>
);

interface MobileFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  minPriceInput: string;
  onMinPriceChange: (val: string) => void;
  maxPriceInput: string;
  onMaxPriceChange: (val: string) => void;
  onResetFilters: () => void;
}

const MobileFiltersDrawer: React.FC<MobileFiltersDrawerProps> = ({
  isOpen,
  onClose,
  activeCategory,
  onCategoryChange,
  minPriceInput,
  onMinPriceChange,
  maxPriceInput,
  onMaxPriceChange,
  onResetFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Content Side Drawer */}
      <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-slide-in">
        <div className="flex items-center justify-between border-b border-app-border pb-4 mb-6">
          <h3 className="font-serif text-app-green text-xl font-bold">
            Filter Options
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:bg-zinc-100 rounded-full"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Categories Section */}
        <div className="flex flex-col gap-3 mb-6">
          <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">
            Categories
          </h4>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                onCategoryChange("all");
                onClose();
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                activeCategory === "all"
                  ? "bg-app-green text-white font-semibold shadow-xs"
                  : "hover:bg-app-cream text-zinc-650"
              }`}
            >
              All Products
            </button>
            {categoriesData.map((category) => (
              <button
                key={category.slug}
                onClick={() => {
                  onCategoryChange(category.slug);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                  activeCategory === category.slug
                    ? "bg-app-green text-white font-semibold shadow-xs"
                    : "hover:bg-app-cream text-zinc-650"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">
            Price Range
          </h4>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-zinc-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-full border border-app-border rounded-xl pl-6 pr-3 py-1.5 text-sm bg-white"
              />
            </div>
            <span className="text-zinc-600">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-zinc-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-full border border-app-border rounded-xl pl-6 pr-3 py-1.5 text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full bg-app-green hover:bg-app-green-light text-white py-2.5 rounded-xl font-semibold shadow-md active:scale-98 transition-all"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="w-full border border-app-border hover:bg-app-cream/35 text-zinc-650 py-2.5 rounded-xl font-semibold active:scale-98 transition-all"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Page Component
// ==========================================

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  const minPriceInput = searchParams.get("minPrice") || "";
  const maxPriceInput = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "default";

  // Mobile filter accordion/drawer toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse numeric values safely
  const minPrice = useMemo(() => {
    const val = parseFloat(minPriceInput);
    return isNaN(val) ? null : val;
  }, [minPriceInput]);

  const maxPrice = useMemo(() => {
    const val = parseFloat(maxPriceInput);
    return isNaN(val) ? null : val;
  }, [maxPriceInput]);

  // Compute final filtered products count for the header
  const filteredCount = useMemo(() => {
    let list = [...dummyProducts];

    // Category filter
    if (activeCategory && activeCategory !== "all") {
      list = list.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    // Price filters
    if (minPrice !== null) {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== null) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    return list.length;
  }, [activeCategory, searchQuery, minPrice, maxPrice]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    setSearchParams(params);
  };

  const handleMinPriceChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete("minPrice");
    } else {
      params.set("minPrice", val);
    }
    setSearchParams(params);
  };

  const handleMaxPriceChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete("maxPrice");
    } else {
      params.set("maxPrice", val);
    }
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    navigate("/products");
  };

  const showResetButton = !!(
    minPriceInput ||
    maxPriceInput ||
    activeCategory !== "all" ||
    searchQuery
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 font-sans">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs activeCategory={activeCategory} activeProductName={""} />

      {/* 2. Page Title Header & Custom Sorting */}
      <ProductHeader
        filteredCount={filteredCount}
        onOpenMobileFilters={() => setMobileFiltersOpen(true)}
      />

      {/* 3. Main Content Row */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Desktop Filters */}
        <SidebarFilters
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          minPriceInput={minPriceInput}
          onMinPriceChange={handleMinPriceChange}
          maxPriceInput={maxPriceInput}
          onMaxPriceChange={handleMaxPriceChange}
          onResetFilters={handleResetFilters}
          showResetButton={showResetButton}
        />

        {/* Horizontal Category Scroller for Mobile */}
        <MobileCategoryScroller
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Mobile Filter Drawer */}
        <MobileFiltersDrawer
          isOpen={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          minPriceInput={minPriceInput}
          onMinPriceChange={handleMinPriceChange}
          maxPriceInput={maxPriceInput}
          onMaxPriceChange={handleMaxPriceChange}
          onResetFilters={handleResetFilters}
        />

        {/* Right Side: Reusable Product Grid */}
        <main className="flex-1">
          <ProductGrid
            products={dummyProducts}
            category={activeCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            searchQuery={searchQuery}
            onResetFilters={handleResetFilters}
            scrollable={true}
          />
        </main>
      </div>
    </div>
  );
};

export default Products;
