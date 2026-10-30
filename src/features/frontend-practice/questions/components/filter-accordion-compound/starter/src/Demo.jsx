// src/Demo.jsx — read-only. The mobile filter drawer controls the accordion from outside:
// the chips above the sidebar open a section directly, like a "Filter by price" shortcut would.
import { useState } from "react";
import FilterSidebar from "./components/FilterSidebar";

export default function Demo() {
  const [openSection, setOpenSection] = useState("categories");
  const [category, setCategory] = useState("bakery");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button onClick={() => setOpenSection("categories")} className="rounded-full border border-app-border bg-white px-3 py-1">
          Open Categories
        </button>
        <button onClick={() => setOpenSection("price")} className="rounded-full border border-app-border bg-white px-3 py-1">
          Open Price Range
        </button>
        <button onClick={() => setOpenSection(null)} className="rounded-full border border-app-border bg-white px-3 py-1">
          Close all
        </button>
        <span className="text-app-text-light">
          parent value: <b>{String(openSection)}</b>
        </span>
      </div>
      <FilterSidebar
        openSection={openSection}
        onOpenSectionChange={(next) => {
          console.log("onOpenSectionChange ->", next);
          setOpenSection(next);
        }}
        activeCategory={category}
        onCategoryChange={setCategory}
        minPrice={min}
        maxPrice={max}
        onPriceChange={(a, b) => {
          setMin(a);
          setMax(b);
        }}
      />
    </div>
  );
}
