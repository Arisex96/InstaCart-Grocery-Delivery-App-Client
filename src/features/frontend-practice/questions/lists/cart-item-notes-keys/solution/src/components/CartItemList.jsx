// src/components/CartItemList.jsx — item rows modelled on client/src/components/CartSideBar.tsx.
// Each line is { product: { _id, name, price, unit, image }, quantity }.
// Every row has a "note" field kept in the row's own state (it is not part of the cart data).
//
// Reported: notes end up on the wrong product after removing or re-sorting items.
import { useState } from "react";
import { Trash2 } from "lucide-react";

const CartRow = ({ item, onRemove }) => {
  const { product, quantity } = item;
  const [note, setNote] = useState("");

  return (
    <li className="bg-app-cream m-2 p-2 flex flex-row items-center justify-between gap-2 rounded-lg">
      <div className="flex flex-row gap-2">
        <div className="h-[56px] w-[56px] rounded-lg overflow-hidden">
          <img src={product.image} alt={product.name} className="size-full object-cover" />
        </div>
        <div>
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-gray-400">
            ${product.price} / {product.unit} × {quantity}
          </p>
          <input
            aria-label={`Note for ${product.name}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note"
            className="mt-1 w-40 rounded-md border border-app-border bg-white px-2 py-1 text-xs"
          />
        </div>
      </div>
      <button
        aria-label={`Remove ${product.name}`}
        onClick={() => onRemove(product._id)}
        className="bg-red-200 px-2 py-1 rounded-full"
      >
        <Trash2 className="size-5" />
      </button>
    </li>
  );
};

const CartItemList = ({ items, onRemove }) => (
  <ul className="max-w-md rounded-2xl border border-app-border bg-white py-1 shadow-sm">
    {items.map((item) => (
      // ROOT CAUSE: `key={index}` ties a row's identity (and its note state) to its POSITION.
      // Removing the first item shifts everyone up, so React hands the first row's state to
      // the next product. FIX: key by the product's stable id.
      <CartRow key={item.product._id} item={item} onRemove={onRemove} />
    ))}
  </ul>
);

export default CartItemList;
