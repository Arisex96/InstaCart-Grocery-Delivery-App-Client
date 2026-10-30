// src/components/CartDrawer.jsx — read-only. A trimmed cart drawer (see client/src/components/CartSideBar.tsx).
// It closes on Escape and on a mousedown outside the panel. The handlers are inline functions that
// read the *current* props, which is exactly what useEventListener must support.
import { useRef } from "react";
import { X } from "lucide-react";
import useEventListener from "../hooks/useEventListener";
import useCartStore from "../store/useCartStore";

const CartDrawer = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const items = useCartStore((state) => state.items);
  const total_price = useCartStore((state) => state.total_price);

  useEventListener("keydown", (event) => {
    if (isOpen && event.key === "Escape") onClose();
  });

  useEventListener("mousedown", (event) => {
    if (isOpen && panelRef.current && !panelRef.current.contains(event.target)) onClose();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/30">
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Your cart"
        className="absolute right-0 top-0 flex h-full w-72 flex-col gap-3 bg-white p-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-app-green">Your cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="rounded-full p-1 hover:bg-app-cream">
            <X className="size-5" />
          </button>
        </div>
        {items.length === 0 && <p className="text-sm text-app-text-light">Your cart is empty.</p>}
        <ul className="flex flex-col gap-2">
          {items.map(({ product, quantity }) => (
            <li key={product._id} className="flex justify-between rounded-lg bg-app-cream p-2 text-sm">
              <span>
                {quantity} × {product.name}
              </span>
              <span className="font-semibold text-app-green">${(product.price * quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto text-right font-bold text-app-green">Total ${total_price.toFixed(2)}</p>
      </aside>
    </div>
  );
};

export default CartDrawer;
