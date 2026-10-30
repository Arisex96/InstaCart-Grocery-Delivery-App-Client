// src/components/CartPanel.jsx — the cart sidebar (see client/src/components/CartSideBar.tsx).
//
// Props
//   onContinue()   called by the "Continue shopping" button of the empty state
//
// The cart lives in the zustand store (src/store/useCartStore.js, read-only):
//   items: [{ product, quantity }]   total_items   total_price
//   update_quantity(productId, qty)  (removes the line when qty <= 0 and clamps to stock)
//   remove_item(productId)           clear_cart()
// Build the panel from the UI requirements in the Problem tab. The Demo adds products to the
// store; the "Target UI" output tab shows the finished design.
import useCartStore from "../store/useCartStore";

const CartPanel = ({ onContinue }) => {
  // TODO: subscribe to what you need with selectors, e.g. useCartStore((s) => s.items)
  const items = useCartStore((s) => s.items);

  // TODO: header "Your cart (N items)" using the total number of units
  // TODO: one <li> per line: image, name, "$price / unit", line total, stepper, remove button
  // TODO: footer with Subtotal and a Clear cart button
  // TODO: empty state with a Continue shopping button (calls onContinue)
  return (
    <section aria-label="Cart" className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">Your cart</h2>
      <p className="mt-3 text-sm text-app-text-light">
        Not built yet ({items.length} lines in the store, onContinue is {onContinue ? "set" : "missing"}).
      </p>
    </section>
  );
};

export default CartPanel;
