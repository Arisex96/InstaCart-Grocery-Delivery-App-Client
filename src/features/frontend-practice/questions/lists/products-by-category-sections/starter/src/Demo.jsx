// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The catalogue is deliberately shuffled (as it arrives from the API) and contains one product
// with a category that is not in the category list.
import GroupedProducts from "./components/GroupedProducts";
import { categories, products } from "./data/products";

const catalogue = [products[8], products[3], products[0], products[10], products[5], products[1], products[7]].concat({
  ...products[4],
  _id: "x1",
  name: "farmers market jam",
  category: "seasonal",
});

export default function Demo() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-app-cream-dark p-3 text-xs text-app-text-light">
        <p>
          <b>Category list:</b> {categories.map((c) => c.name).join(" → ")}
        </p>
        {/* The Products page renders this same array. It must keep its order. */}
        <p>
          <b>Order of the original array:</b> {catalogue.map((p) => p.name).join(", ")}
        </p>
      </div>
      <GroupedProducts products={catalogue} categories={categories} />
    </div>
  );
}
