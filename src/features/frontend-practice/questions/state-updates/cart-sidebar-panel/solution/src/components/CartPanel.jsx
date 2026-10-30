// src/components/CartPanel.jsx — the cart sidebar (see client/src/components/CartSideBar.tsx).
//
// Props
//   onContinue()   called by the "Continue shopping" button of the empty state
//
// APPROACH: the store is the single source of truth. Subscribe with selectors so the panel
// re-renders whenever anything (even another component) changes the cart, and derive every
// figure during render. No local copy of the cart, no effects.
import { MinusIcon, PlusIcon, Trash2Icon, ShoppingCartIcon } from "lucide-react";
import useCartStore from "../store/useCartStore";

const money = (amount) => "$" + amount.toFixed(2); // toFixed also hides 1.2 × 3 = 3.5999999…

const CartPanel = ({ onContinue }) => {
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.total_items);
  const totalPrice = useCartStore((s) => s.total_price);
  const update_quantity = useCartStore((s) => s.update_quantity);
  const remove_item = useCartStore((s) => s.remove_item);
  const clear_cart = useCartStore((s) => s.clear_cart);

  return (
    <section aria-label="Cart" className="flex flex-col rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">{`Your cart (${totalItems} ${totalItems === 1 ? "item" : "items"})`}</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <ShoppingCartIcon className="size-10 text-app-border" />
          <p className="text-sm text-app-text-light">Your cart is empty</p>
          <button
            onClick={onContinue}
            className="rounded-full bg-app-green px-5 py-2 text-sm font-semibold text-white hover:bg-app-green-light"
          >
            Continue shopping
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-app-cream-dark">
            {items.map(({ product, quantity }) => (
              <li key={product._id} className="flex items-center gap-3 py-3">
                <img src={product.image} alt={product.name} className="size-14 shrink-0 rounded-lg bg-app-cream object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-app-text">{product.name}</p>
                  <p className="text-xs text-app-text-light">{`${money(product.price)} / ${product.unit}`}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      aria-label={`Decrease quantity of ${product.name}`}
                      onClick={() => update_quantity(product._id, quantity - 1)} // the store removes the line at 0
                      className="rounded-full bg-app-cream-dark p-1 hover:bg-app-border"
                    >
                      <MinusIcon className="size-3.5" />
                    </button>
                    <span aria-label={`Quantity of ${product.name}`} className="min-w-6 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      aria-label={`Increase quantity of ${product.name}`}
                      disabled={quantity >= product.stock}
                      onClick={() => update_quantity(product._id, quantity + 1)}
                      className="rounded-full bg-app-cream-dark p-1 hover:bg-app-border disabled:opacity-40"
                    >
                      <PlusIcon className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-app-green">{money(product.price * quantity)}</span>
                  <button
                    aria-label={`Remove ${product.name}`}
                    onClick={() => remove_item(product._id)}
                    className="rounded-full p-1 text-app-error hover:bg-red-50"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-2 flex items-center justify-between border-t border-app-border pt-3">
            <dt className="text-sm text-app-text-light">Subtotal</dt>
            <dd className="text-lg font-bold text-app-green">{money(totalPrice)}</dd>
          </dl>
          <button
            onClick={clear_cart}
            className="mt-3 self-start rounded-full border border-app-border px-4 py-1.5 text-xs font-medium text-app-text-light hover:bg-app-cream"
          >
            Clear cart
          </button>
        </>
      )}
    </section>
  );
};

export default CartPanel;
