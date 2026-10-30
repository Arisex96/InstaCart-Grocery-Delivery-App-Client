// src/components/ProductBrowser.jsx — filter sidebar + result list of the Products page
// (see client/src/pages/Products.tsx and client/src/components/ProductGrid.tsx).
//
// Props
//   products     [{ _id, name, price, originalPrice, discount, rating, category, ... }]  (never mutate it)
//   categories   [{ slug, name }]
//
// APPROACH: state holds only the four control values. The visible list is derived during render
// from a COPY of `products` (the prop may be frozen, and sort() mutates). Empty price inputs
// mean "no limit", not 0.
import { useMemo, useState } from "react";

const SORTS = [
  { value: "default", label: "Default", compare: null },
  { value: "price-asc", label: "Price: Low to High", compare: (a, b) => a.price - b.price },
  { value: "price-desc", label: "Price: High to Low", compare: (a, b) => b.price - a.price },
  { value: "rating", label: "Highest rated", compare: (a, b) => b.rating - a.rating },
  { value: "discount", label: "Biggest discount", compare: (a, b) => b.discount - a.discount },
];

const money = (n) => "$" + n.toFixed(2);

const ProductBrowser = ({ products, categories }) => {
  const [category, setCategory] = useState("all");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("default");

  const minValue = min === "" ? null : Number(min);
  const maxValue = max === "" ? null : Number(max);
  const rangeInvalid = minValue !== null && maxValue !== null && minValue > maxValue;
  const isActive = category !== "all" || min !== "" || max !== "" || sort !== "default";

  const visible = useMemo(() => {
    let list = products.filter((p) => category === "all" || p.category === category);
    if (!rangeInvalid) {
      // Inclusive bounds; an empty input applies no limit at all.
      if (minValue !== null) list = list.filter((p) => p.price >= minValue);
      if (maxValue !== null) list = list.filter((p) => p.price <= maxValue);
    }
    const compare = SORTS.find((s) => s.value === sort)?.compare;
    // list is already a new array (filter), so sorting it never touches the prop. Array#sort is
    // stable, so ties keep the original order.
    return compare ? list.sort(compare) : list;
  }, [products, category, minValue, maxValue, rangeInvalid, sort]);

  const clear = () => {
    setCategory("all");
    setMin("");
    setMax("");
    setSort("default");
  };

  const input = "w-full rounded-xl border border-app-border bg-app-cream px-3 py-2 text-sm";

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside aria-label="Filters" className="flex flex-col gap-5 self-start rounded-2xl border border-app-border bg-white p-5">
        <fieldset>
          <legend className="mb-2 border-b border-app-border pb-2 text-xs font-bold uppercase tracking-wide text-app-green">
            Category
          </legend>
          <div className="flex flex-col gap-1">
            {[{ slug: "all", name: "All products" }, ...categories].map((c) => (
              <label
                key={c.slug}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                  category === c.slug ? "bg-app-green font-semibold text-white" : "text-app-text hover:bg-app-cream"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c.slug}
                  checked={category === c.slug}
                  onChange={() => setCategory(c.slug)}
                  className="sr-only"
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2">
          <div>
            <label htmlFor="min-price" className="mb-1 block text-xs font-semibold text-app-text-light">
              Min price
            </label>
            <input id="min-price" type="number" min="0" value={min} onChange={(e) => setMin(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="max-price" className="mb-1 block text-xs font-semibold text-app-text-light">
              Max price
            </label>
            <input id="max-price" type="number" min="0" value={max} onChange={(e) => setMax(e.target.value)} className={input} />
          </div>
        </div>
        {rangeInvalid && (
          <p role="alert" className="-mt-3 text-xs text-app-error">
            Min price must be at most max price
          </p>
        )}

        <div>
          <label htmlFor="sort-by" className="mb-1 block text-xs font-semibold text-app-text-light">
            Sort by
          </label>
          <select id="sort-by" value={sort} onChange={(e) => setSort(e.target.value)} className={input}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={clear}
          disabled={!isActive}
          className="rounded-full border border-app-border px-4 py-2 text-sm font-medium text-app-text hover:bg-app-cream disabled:opacity-40"
        >
          Clear filters
        </button>
      </aside>

      <div>
        <p role="status" className="mb-3 text-sm font-semibold text-app-green">
          {visible.length} {visible.length === 1 ? "product" : "products"}
        </p>
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-app-border bg-white p-8 text-center text-sm text-app-text-light">
            No products match your filters
          </p>
        ) : (
          <ul aria-label="Products" className="grid gap-2 sm:grid-cols-2">
            {visible.map((p) => (
              <li key={p._id} className="flex items-center gap-3 rounded-xl border border-app-border bg-white p-3">
                <img src={p.image} alt="" className="size-12 rounded-lg bg-app-cream object-cover" />
                <span className="flex-1 text-sm font-medium text-app-text">{p.name}</span>
                <span className="text-sm font-bold text-app-green">{money(p.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductBrowser;
