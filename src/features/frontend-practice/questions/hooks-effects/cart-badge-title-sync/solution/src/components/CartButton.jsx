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

  // FIX (restore): remember the title we found and put it back on unmount.
  // This effect must be declared BEFORE the title effect: effects run in
  // declaration order, so it reads document.title before we overwrite it.
  useEffect(() => {
    const previousTitle = document.title;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // ROOT CAUSE: the dependency array was empty, so this ran once after the first render
  // and kept using the first render's total_items / total_price forever. The badge is
  // computed during render, which is why it stayed correct.
  // FIX: depend on every reactive value the effect reads.
  useEffect(() => {
    document.title = formatTitle(total_items, total_price);
  }, [total_items, total_price]);

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
