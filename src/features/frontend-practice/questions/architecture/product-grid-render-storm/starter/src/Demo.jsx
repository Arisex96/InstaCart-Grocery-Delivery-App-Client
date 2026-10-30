// src/Demo.jsx — read-only. The live preview renders this file's default export.
// "Row renders" is the total number of times any ProductRow function ran.
import { useEffect, useRef, useState } from "react";
import ProductBrowser from "./components/ProductBrowser";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

const sample = products.slice(0, 6);

export default function Demo() {
  const renders = useRef(0);
  const [shown, setShown] = useState(0);
  const toggleCart = useCartStore((state) => state.toggle_cart_view);
  const cartOpen = useCartStore((state) => state.isCartOpen);

  // Stable on purpose: it must not be the reason rows re-render.
  const onRowRender = useRef(() => {
    renders.current += 1;
  }).current;

  // Publish the ref to the screen a few times per second (setting state while rendering is not allowed).
  useEffect(() => {
    const timer = setInterval(() => setShown(renders.current), 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl bg-app-cream-dark px-4 py-2 text-sm">
        <span>
          Row renders: <b data-testid="row-renders" className="text-app-green">{shown}</b>
        </span>
        <button
          onClick={toggleCart}
          className="ml-auto rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold"
        >
          Toggle cart drawer ({cartOpen ? "open" : "closed"})
        </button>
      </div>
      <ProductBrowser products={sample} onRowRender={onRowRender} />
    </div>
  );
}
