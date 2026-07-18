import { useState, useMemo } from "react";
import { dummyProducts, categoriesData } from "../assets/assets";
import ProductGrid from "../components/ProductGrid";
import { Tag, Sparkles } from "lucide-react";

const FlashDeals = () => {
  // 1. Filter products with actual discount > 0
  const dealProducts = useMemo(() => {
    return dummyProducts.filter((p) => p.discount > 0);
  }, []);

  // 2. Dynamic Category filter collection
  // Only categories that actually contain products with active discounts
  const dealCategories = useMemo(() => {
    const activeSlugs = Array.from(
      new Set(dealProducts.map((p) => p.category)),
    );
    return categoriesData.filter((c) => activeSlugs.includes(c.slug));
  }, [dealProducts]);

  // Selected category state
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 font-sans">
      {/* Premium Green Flash Sale Header Banner */}
      <section className="relative w-full bg-gradient-to-r from-app-green via-app-green-light to-emerald-800 rounded-3xl overflow-hidden shadow-md p-8 sm:p-12 text-white flex flex-col justify-start gap-4">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>

        {/* Banner Details */}
        <div className="relative z-10 flex flex-col gap-3 max-w-2xl">
          <div className="flex items-center gap-2 bg-emerald-950/65 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit border border-emerald-800/30">
            <Tag className="size-4 text-emerald-400" />
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 flex items-center gap-1 font-sans">
              Exclusive Value Offers{" "}
              <Sparkles className="size-3 fill-emerald-300" />
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">
            Special Flash Deals
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
            Grab products with up to 50% discount. Handpicked selection of
            farm-fresh fruits, pantry staples, and household favorites refreshed
            daily.
          </p>
        </div>
      </section>

      {/* Category Navigation Selector */}
      <div className="w-full border-b border-app-border pb-4 flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-2xl font-serif text-app-green font-bold">
            Category Deals
          </h2>
          <p className="text-sm text-zinc-550">
            Filter discounted products by category
          </p>
        </div>

        {/* Scroll list */}
        <div className="overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2.5 w-max">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === "all"
                  ? "bg-app-green text-white font-bold"
                  : "bg-white border border-app-border text-zinc-700 hover:bg-app-cream"
              }`}
            >
              All Deals ({dealProducts.length})
            </button>
            {dealCategories.map((category) => {
              const categoryDealsCount = dealProducts.filter(
                (p) => p.category === category.slug,
              ).length;

              return (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                    selectedCategory === category.slug
                      ? "bg-app-green text-white font-bold"
                      : "bg-white border border-app-border text-zinc-700 hover:bg-app-cream"
                  }`}
                >
                  {category.name} ({categoryDealsCount})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deals Products Listing Grid */}
      <main className="w-full">
        <ProductGrid
          products={dealProducts}
          category={selectedCategory}
          sortBy="discount"
          onResetFilters={() => setSelectedCategory("all")}
          scrollable={true}
        />
      </main>
    </div>
  );
};

export default FlashDeals;
