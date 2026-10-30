// src/components/ProductBrowser.jsx — search box + cart badge + list of ProductRow, like the Products page.
// Reported: on a 200-product catalogue every keystroke (and every cart change) re-renders every row.
//
// Props: products (array of Product), onRowRender (called by each row while it renders).
import { useCallback, useMemo, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import useCartStore from "../store/useCartStore";
import ProductRow from "./ProductRow";

const ProductBrowser = ({ products, onRowRender }) => {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");

  // ROOT CAUSE (store): `useCartStore()` without a selector subscribes to the WHOLE store, so any change
  // (even isCartOpen) re-rendered this component. FIX: select just the slices that are displayed/used.
  // Actions are stable references in zustand, so selecting add_item never triggers a re-render.
  const total_items = useCartStore((state) => state.total_items);
  const add_item = useCartStore((state) => state.add_item);

  // ROOT CAUSE (new array each render): FIX: derive it with useMemo from its real inputs.
  const visible = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())),
    [products, query],
  );

  // ROOT CAUSE (new function each render): an inline `(p) => add_item(p, 1)` defeats React.memo because
  // the prop changes on every render. FIX: keep one stable function with useCallback.
  const handleAdd = useCallback((product) => add_item(product, 1), [add_item]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-app-text-light" />
          <input
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for groceries..."
            className="w-full rounded-full border border-app-border bg-white py-2 pl-9 pr-4 text-sm"
          />
        </div>
        <span className="flex items-center gap-1 rounded-full bg-app-green px-3 py-1.5 text-sm font-bold text-white">
          <ShoppingCart className="size-4" /> <span data-testid="cart-badge">{total_items}</span>
        </span>
      </div>

      <label className="block text-xs font-semibold text-app-text-light">
        Note for shopper
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm font-normal"
        />
      </label>

      <ul className="flex flex-col gap-2">
        {visible.map((product) => (
          <ProductRow key={product._id} product={product} onAdd={handleAdd} onRender={onRowRender} />
        ))}
      </ul>
    </div>
  );
};

export default ProductBrowser;
