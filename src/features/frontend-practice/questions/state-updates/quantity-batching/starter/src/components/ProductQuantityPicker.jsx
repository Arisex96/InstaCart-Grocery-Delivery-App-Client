// src/components/ProductQuantityPicker.jsx — quantity picker on the product page.
//
// Props:
//   product            a product from the catalogue (uses name, price, stock)
//   onAdd(product, n)  async; resolves when the cart API confirmed the addition
//
// State: `qty` is the quantity currently chosen, `addedTotal` the units confirmed this visit.
import { useState } from "react";

const ProductQuantityPicker = ({ product, onAdd }) => {
  const [qty, setQty] = useState(1);
  const [addedTotal, setAddedTotal] = useState(0);

  const atMax = qty >= product.stock;

  const addThree = () => {
    // Bulk shoppers asked for a quick +3 button.
    setQty(Math.min(product.stock, qty + 1));
    setQty(Math.min(product.stock, qty + 1));
    setQty(Math.min(product.stock, qty + 1));
  };

  const handleAdd = async () => {
    const added = qty;
    setQty(1);
    await onAdd(product, added);
    setAddedTotal(addedTotal + added);
  };

  return (
    <div className="w-72 rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <p className="font-bold text-app-text">{product.name}</p>
      <p className="text-xs text-app-text-light">
        ${product.price.toFixed(2)} · {product.stock} in stock
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          aria-label="Decrease"
          disabled={qty <= 1}
          onClick={() => setQty(qty - 1)}
          className="rounded-full bg-gray-200 px-3 py-1 disabled:opacity-40"
        >
          -
        </button>
        <span aria-label="Quantity" className="min-w-6 text-center font-semibold">
          {qty}
        </span>
        <button
          aria-label="Increase"
          disabled={atMax}
          onClick={() => setQty(qty + 1)}
          className="rounded-full bg-gray-200 px-3 py-1 disabled:opacity-40"
        >
          +
        </button>
        <button
          aria-label="Add three"
          disabled={atMax}
          onClick={addThree}
          className="rounded-full bg-app-cream-dark px-3 py-1 text-sm font-semibold disabled:opacity-40"
        >
          +3
        </button>
      </div>

      <button
        onClick={handleAdd}
        className="mt-3 w-full rounded-full bg-app-green py-2 text-sm font-semibold text-white hover:bg-app-green-light"
      >
        Add to cart
      </button>
      <p className="mt-2 text-xs text-app-text-light">
        Added this visit: <span data-testid="added-total">{addedTotal}</span>
      </p>
    </div>
  );
};

export default ProductQuantityPicker;
