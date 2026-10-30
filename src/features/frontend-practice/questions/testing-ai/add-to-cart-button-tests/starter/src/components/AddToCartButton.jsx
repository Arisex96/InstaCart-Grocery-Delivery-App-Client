// src/components/AddToCartButton.jsx — quantity stepper + "Add to cart" used on the product page
// (client/src/pages/ProductPage.tsx). It talks to the zustand cart store exactly like the real one:
//   add_item(product, quantity)   — the store itself also clamps to stock and shows a toast.
//
// Rules:
//   * the selected quantity starts at 1, never goes below 1 and never above product.stock
//   * "Add to cart" adds the SELECTED quantity, then resets the selector to 1
//   * a sold-out product (stock 0) shows a disabled "Out of stock" button
//
// This file is read-only: your job is to write the tests for it.
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import useCartStore from "../store/useCartStore";

const AddToCartButton = ({ product }) => {
  const add_item = useCartStore((state) => state.add_item);
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;

  const decrease = () => setQuantity((q) => Math.max(1, q - 1));
  const increase = () => setQuantity((q) => Math.min(product.stock, q + 1));

  const handleAdd = () => {
    if (outOfStock) return;
    add_item(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="flex items-center gap-3">
      <div role="group" aria-label="Quantity" className="flex items-center gap-2 rounded-full border border-app-border bg-white px-2 py-1">
        <button onClick={decrease} aria-label="Decrease quantity" className="rounded-full bg-gray-200 p-1">
          <Minus className="size-4" />
        </button>
        <span data-testid="quantity" className="min-w-6 text-center text-sm font-semibold">
          {quantity}
        </span>
        <button onClick={increase} aria-label="Increase quantity" className="rounded-full bg-gray-200 p-1">
          <Plus className="size-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="rounded-full bg-app-green px-5 py-2 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-40"
      >
        {outOfStock ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
};

export default AddToCartButton;
