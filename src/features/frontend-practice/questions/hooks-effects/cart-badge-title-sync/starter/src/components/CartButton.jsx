// src/components/CartButton.jsx — trimmed version of the cart button in client/src/components/Navbar.tsx.
// It shows an item-count badge and mirrors the cart into the browser tab title, so shoppers
// who switch tabs can see what is in their cart.
//
// Reported: "the badge is always right, but the tab title still shows the cart as it was
// when the page loaded".
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import useCartStore from "../store/useCartStore";

const BASE_TITLE = "Instacart";

const formatTitle = (totalItems, totalPrice) =>
  totalItems > 0 ? "(" + totalItems + ") Cart · $" + totalPrice.toFixed(2) + " | " + BASE_TITLE : BASE_TITLE;

const CartButton = () => {
  const total_items = useCartStore((state) => state.total_items);
  const total_price = useCartStore((state) => state.total_price);
  const toggle_cart_view = useCartStore((state) => state.toggle_cart_view);

  // Keep the tab title in sync with the cart.
  useEffect(() => {
    document.title = formatTitle(total_items, total_price);
  }, []);

  return (
    <button
      onClick={toggle_cart_view}
      aria-label="Open cart"
      className="relative flex items-center gap-2 rounded-full border border-app-border bg-white px-4 py-2 text-sm font-semibold text-app-green hover:bg-app-cream"
    >
      <ShoppingCart className="size-5" />
      Cart
      {total_items > 0 && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-app-orange text-[11px] font-bold text-white">
          {total_items}
        </span>
      )}
    </button>
  );
};

export default CartButton;
