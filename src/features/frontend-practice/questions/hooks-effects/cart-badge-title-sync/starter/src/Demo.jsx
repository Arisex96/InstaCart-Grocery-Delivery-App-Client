// src/Demo.jsx — read-only. The live preview renders this file's default export.
// The tab title of this preview frame is not visible to you, so the demo mirrors
// document.title into the page a few times per second ("Tab title" below).
import { useEffect, useState } from "react";
import CartButton from "./components/CartButton";
import ProductCard from "./components/ProductCard";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

const shown = [products[0], products[3], products[4]];

export default function Demo() {
  const clear_cart = useCartStore((state) => state.clear_cart);
  const [title, setTitle] = useState(document.title);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTitle(document.title), 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {showButton ? <CartButton /> : <span className="text-sm text-app-text-light">(cart button unmounted)</span>}
        <button
          onClick={clear_cart}
          className="rounded-full border border-app-border bg-white px-3 py-2 text-sm hover:bg-app-cream"
        >
          Clear cart
        </button>
        <button
          onClick={() => setShowButton((v) => !v)}
          className="rounded-full border border-app-border bg-white px-3 py-2 text-sm hover:bg-app-cream"
        >
          {showButton ? "Unmount cart button" : "Mount cart button"}
        </button>
      </div>
      <p className="text-sm text-app-text-light">
        Tab title: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-app-green">{title || "(empty)"}</code>
      </p>
      <div className="grid grid-cols-3 gap-3">
        {shown.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
