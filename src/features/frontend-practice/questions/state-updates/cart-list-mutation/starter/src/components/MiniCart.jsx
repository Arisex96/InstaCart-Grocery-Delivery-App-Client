// src/components/MiniCart.jsx — used by the "Reorder" drawer. Styling follows Item_card in
// client/src/components/CartSideBar.tsx.
//
// initialItems: [{ product, quantity }] taken from a previous order (the order history page
// still renders the same objects, so they must stay as they are).
import { useState } from "react";
import { Trash2 } from "lucide-react";

const MiniCart = ({ initialItems }) => {
  const [items, setItems] = useState(initialItems);

  const find = (productId) => items.find((it) => it.product._id === productId);

  const increase = (productId) => {
    const item = find(productId);
    if (item.quantity < item.product.stock) {
      item.quantity += 1;
    }
    setItems(items);
  };

  const decrease = (productId) => {
    const item = find(productId);
    item.quantity -= 1;
    if (item.quantity <= 0) {
      items.splice(items.indexOf(item), 1);
    }
    setItems(items);
  };

  const remove = (productId) => {
    items.splice(items.indexOf(find(productId)), 1);
    setItems(items);
  };

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
