// src/components/FilterSidebar.jsx — read-only. Modelled on SidebarFilters in
// client/src/pages/Products.tsx, rebuilt on top of the compound Accordion.
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./ui/Accordion";
import { categories } from "../data/products";

const FilterSidebar = ({ openSection, onOpenSectionChange, activeCategory, onCategoryChange, minPrice, maxPrice, onPriceChange }) => (
  <aside className="w-72 rounded-2xl border border-app-border bg-white px-5 py-2 shadow-sm">
    <Accordion value={openSection} onValueChange={onOpenSectionChange}>
      <AccordionItem value="categories">
        <AccordionTrigger>Categories</AccordionTrigger>
        <AccordionPanel>
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => onCategoryChange(category.slug)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium ${
                  activeCategory === category.slug ? "bg-app-green text-white" : "hover:bg-app-cream"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="price">
        <AccordionTrigger>Price Range</AccordionTrigger>
        <AccordionPanel>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => onPriceChange(e.target.value, maxPrice)}
              className="w-full rounded-xl border border-app-border px-3 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => onPriceChange(minPrice, e.target.value)}
              className="w-full rounded-xl border border-app-border px-3 py-1.5 text-sm"
            />
          </div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  </aside>
);

export default FilterSidebar;
