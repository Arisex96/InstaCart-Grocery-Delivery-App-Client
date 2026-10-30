// src/components/MiniCart.jsx — used by the "Reorder" drawer. Styling follows Item_card in
// client/src/components/CartSideBar.tsx.
//
// initialItems: [{ product, quantity }] taken from a previous order (the order history page
// still renders the same objects, so they must stay as they are).
import { useState } from "react";
import { Trash2 } from "lucide-react";

const MiniCart = ({ initialItems }) => {
  const [items, setItems] = useState(initialItems);

  // ROOT CAUSE: the old handlers did `item.quantity += 1` / `items.splice(...)` and then
  // `setItems(items)`. That is the SAME array reference, so React sees "no change" and skips
  // the render. The mutation also edited the caller's objects (the order history).
  // FIX: never modify state in place. Build a new array (map / filter) and copy the one
  // item that changes with the spread operator; functional updates always read fresh state.
  const increase = (productId) =>
    setItems((prev) =>
      prev.map((it) =>
        it.product._id === productId && it.quantity < it.product.stock ? { ...it, quantity: it.quantity + 1 } : it,
      ),
    );

  const decrease = (productId) =>
    setItems((prev) =>
      prev
        .map((it) => (it.product._id === productId ? { ...it, quantity: it.quantity - 1 } : it))
        .filter((it) => it.quantity > 0),
    );

  const remove = (productId) => setItems((prev) => prev.filter((it) => it.product._id !== productId));

  const total = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);

  if (items.length === 0) {
    return <p className="rounded-2xl bg-white p-4 text-sm text-app-text-light">Nothing to reorder</p>;
  }

  return (
    <div className="max-w-md rounded-2xl border border-app-border bg-white p-2">
      {items.map(({ product, quantity }) => (
        <div key={product._id} className="bg-app-cream m-2 p-2 flex flex-row items-center justify-between rounded-lg">
          <div>
            <h3 className="text-sm font-medium">{product.name}</h3>
            <p className="text-xs text-gray-400">
              ${product.price.toFixed(2)} / {product.unit}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <button aria-label={"Decrease " + product.name} onClick={() => decrease(product._id)} className="bg-gray-200 px-2 rounded-full">
              -
            </button>
            <span aria-label={product.name + " quantity"} className="text-sm">
              {quantity}
            </span>
            <button aria-label={"Increase " + product.name} onClick={() => increase(product._id)} className="bg-gray-200 px-2 rounded-full">
              +
            </button>
            <button aria-label={"Remove " + product.name} onClick={() => remove(product._id)} className="bg-red-200 px-2 rounded-full">
              <Trash2 className="size-5" />
            </button>
          </div>
        </div>
      ))}
      <p className="px-3 pb-1 text-right text-sm font-semibold">Total: ${total.toFixed(2)}</p>
    </div>
  );
};

export default MiniCart;
