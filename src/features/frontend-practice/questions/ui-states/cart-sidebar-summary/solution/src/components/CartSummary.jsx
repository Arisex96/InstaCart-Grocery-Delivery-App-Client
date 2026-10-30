// src/components/CartSummary.jsx — trimmed copy of the panel in client/src/components/CartSideBar.tsx.
//
// Props
//   items       [{ product, quantity }]  same shape as useCartStore().items
//   onCheckout  called when the shopper presses Checkout
//
// Reported by support: the header count looks wrong, prices have strange decimals,
// and the panel gives no feedback when the cart is empty.
import { Trash2 } from "lucide-react";

// FIX (decimals): one helper so every price is rendered with exactly two decimals.
// ROOT CAUSE: 1.2 * 3 === 3.5999999999999996 in binary floating point, and interpolating
// the raw number printed it as is (or dropped trailing zeros: 2.4 instead of 2.40).
const money = (amount) => `$${amount.toFixed(2)}`;

const CartSummary = ({ items, onCheckout }) => {
  // ROOT CAUSE (count): items.length counts cart LINES. FIX: add up the quantities.
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // FIX (empty state): derive it once and reuse it for the message, the subtotal and the button.
  const isEmpty = items.length === 0;

  return (
    <aside className="w-80 rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      {/* FIX (plural): the word depends on the number of units */}
      <h2 className="font-serif text-xl text-app-green">
        Your cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h2>

      {isEmpty ? (
        <p className="mt-4 rounded-lg bg-app-cream p-4 text-center text-sm text-app-text-light">Your cart is empty</p>
      ) : (
        <ul className="mt-3">
          {items.map((item) => (
            <li
              key={item.product._id}
              className="bg-app-cream my-2 p-2 flex flex-row items-center justify-between rounded-lg"
            >
              <div>
                <h3 className="text-sm font-medium">{item.product.name}</h3>
                <p className="text-xs text-gray-400">
                  {item.quantity} × {money(item.product.price)} / {item.product.unit}
                </p>
              </div>
              <p className="text-md text-black">{money(item.product.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      )}

      {!isEmpty && (
        <div className="mt-3 flex items-center justify-between border-t border-app-border pt-3 text-sm">
          <span className="text-app-text-light">Subtotal</span>
          <span className="font-bold text-app-green">{money(subtotal)}</span>
        </div>
      )}

      <button
        onClick={onCheckout}
        disabled={isEmpty}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-app-green py-2.5 font-semibold text-white hover:bg-app-green-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="size-4 hidden" />
        Checkout
      </button>
    </aside>
  );
};

export default CartSummary;
