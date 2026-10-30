// src/components/CartBadge.jsx — read-only. Reads the cart STATE; memoised on its own props.
import { memo } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartState } from "../context/CartContext";

const CartBadge = ({ onRender }) => {
  const { count, total } = useCartState();
  onRender?.("badge");

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-app-green px-4 py-2 text-sm font-semibold text-white">
      <ShoppingCart className="size-4" />
      <span data-testid="cart-summary">
        {count} {count === 1 ? "item" : "items"} · ${total.toFixed(2)}
      </span>
    </div>
  );
};

export default memo(CartBadge);
