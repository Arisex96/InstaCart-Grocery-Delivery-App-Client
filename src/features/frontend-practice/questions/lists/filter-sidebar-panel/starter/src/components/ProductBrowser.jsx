// src/components/ProductBrowser.jsx — filter sidebar + result list of the Products page
// (see client/src/pages/Products.tsx and client/src/components/ProductGrid.tsx).
//
// Props
//   products     [{ _id, name, price, originalPrice, discount, rating, category, ... }]  (never mutate it)
//   categories   [{ slug, name }]
//
// Build it from the UI requirements in the Problem tab. The Demo switches catalogues; the
// "Target UI" output tab shows the finished design.
import { useState } from "react";

const ProductBrowser = ({ products, categories }) => {
  // TODO: state for the controls: category ("all" | slug), min, max (strings), sort
  const [category] = useState("all");

  // TODO: derive the visible products: category, inclusive min/max (empty = no limit), sort a COPY.

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      {/* TODO: <aside aria-label="Filters"> with the category radios, price inputs, sort select, Clear filters */}
      <aside aria-label="Filters" className="rounded-2xl border border-app-border bg-white p-5">
        <h2 className="font-serif text-lg text-app-green">Filters</h2>
        <p className="mt-2 text-sm text-app-text-light">
          {categories.length} categories, selected: {category}
        </p>
      </aside>

      <div>
        {/* TODO: status line with the result count, then the <ul aria-label="Products"> or the no-results message */}
        <ul aria-label="Products" className="space-y-2">
          {products.map((product) => (
            <li key={product._id} className="rounded-xl bg-white px-4 py-2 text-sm">
              {product.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductBrowser;
