// src/components/AddToCartControl.jsx — "optimistic" add button for the product page.
// The quantity in the cart is shown instantly, then synced with the server:
//   POST /cart/items { productId, quantity }  ->  { data: { productId, quantity } }
// `quantity` is the new ABSOLUTE quantity. The server answers 409 "Only N in stock" above the stock.
//
// Reported by support: numbers jump back and forth on slow networks, the busy state vanishes early,
// and an item that was added successfully sometimes "disappears" after an unrelated failure.
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import api from "../api/axios";

const AddToCartControl = ({ product }) => {
  const [quantity, setQuantity] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async () => {
    const previous = quantity;
    setError(null);
    setQuantity(quantity + 1);
    setSaving(true);
    try {
      const { data } = await api.post("/cart/items", { productId: product._id, quantity: quantity + 1 });
      setQuantity(data.quantity);
    } catch (err) {
      setQuantity(previous);
      setError(err.response?.data?.message ?? "Could not update your cart.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-w-xs flex-col gap-2 rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-app-text">{product.name}</p>
          <p className="text-xs text-app-text-light" aria-live="polite">
            In cart: {quantity}
          </p>
        </div>
        <button
          onClick={handleAdd}
          aria-label={"Add " + product.name + " to cart"}
          aria-busy={saving}
          className="rounded-full bg-app-green p-2 text-white shadow-md hover:bg-app-green-light active:scale-95"
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
      {saving && <p className="text-xs text-app-text-light">Saving…</p>}
      {error && (
        <p role="alert" className="text-xs font-semibold text-app-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddToCartControl;
