// src/components/CategoryChipBar.jsx — mobile replacement for the category sidebar on the Products page
// (see the category buttons in client/src/pages/Products.tsx).
//
// Props
//   categories  [{ slug, name }]            order matters
//   products    [{ _id, category, ... }]    category is a category slug
//   active      "all" | <slug>              the selected chip (default "all")
//   onChange    (slug | "all") => void

// APPROACH: nothing here needs state. Counts, labels, the active style and the disabled
// flag are all derived from props during render, so the bar can never drift out of sync.
const CategoryChipBar = ({ categories, products, active = "all", onChange }) => {
  const counts = {};
  for (const product of products) counts[product.category] = (counts[product.category] ?? 0) + 1;

  // One list for All + categories, so every chip shares the same markup.
  const chips = [
    { slug: "all", label: `All (${products.length})`, empty: false },
    ...categories.map((c) => {
      const count = counts[c.slug] ?? 0;
      return { slug: c.slug, label: `${c.name} (${count})`, empty: count === 0 };
    }),
  ];

  return (
    <div role="group" aria-label="Categories" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => {
        const isActive = chip.slug === active;
        return (
          <button
            key={chip.slug}
            type="button"
            aria-pressed={isActive}
            disabled={chip.empty} // the attribute, not just a grey style: it also blocks clicks
            onClick={() => onChange?.(chip.slug)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all ${
              isActive
                ? "border-app-green bg-app-green font-semibold text-white shadow-sm"
                : "border-app-border bg-white text-app-text hover:bg-app-cream"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryChipBar;
