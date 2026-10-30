// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// This demo counts the keydown/mousedown listeners currently attached to window
// ("Active window listeners"). A correct hook keeps that number at 2 (one per hook call in
// CartDrawer) no matter how often the drawer is remounted.
import { useEffect, useState } from "react";
import CartDrawer from "./components/CartDrawer";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

const realAdd = (window.__realAddEventListener ??= window.addEventListener);
const realRemove = (window.__realRemoveEventListener ??= window.removeEventListener);
const attached = (window.__attachedListeners = new Set());
const watched = new Set(["keydown", "mousedown"]);
window.addEventListener = function (type, listener, options) {
  if (watched.has(type)) attached.add(listener);
  return realAdd.call(this, type, listener, options);
};
window.removeEventListener = function (type, listener, options) {
  if (watched.has(type)) attached.delete(listener);
  return realRemove.call(this, type, listener, options);
};

export default function Demo() {
  const add_item = useCartStore((state) => state.add_item);
  const [open, setOpen] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = setInterval(() => setCount(attached.size), 200);
    return () => clearInterval(poll);
  }, []);

  const buttonClass = "rounded-full border border-app-border bg-white px-3 py-2 text-sm hover:bg-app-cream";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setOpen(true)} className={buttonClass}>
          Open cart
        </button>
        <button onClick={() => add_item(products[0], 1)} className={buttonClass}>
          Add bananas
        </button>
        <button onClick={() => setGeneration((g) => g + 1)} className={buttonClass}>
          Remount drawer
        </button>
      </div>
      <p className="text-sm text-app-text-light">
        Active window listeners: <b className="text-app-green">{count}</b> · drawer mounted {generation + 1}×
      </p>
      <p className="text-sm text-app-text-light">Open the cart, then press Escape or click outside the panel.</p>
      <CartDrawer key={generation} isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
