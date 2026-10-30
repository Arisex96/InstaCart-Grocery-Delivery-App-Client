// src/components/AddToCartControl.jsx — "optimistic" add button for the product page.
// The quantity in the cart is shown instantly, then synced with the server:
//   POST /cart/items { productId, quantity }  ->  { data: { productId, quantity } }
// `quantity` is the new ABSOLUTE quantity. The server answers 409 "Only N in stock" above the stock.
//
// Reported by support: numbers jump back and forth on slow networks, the busy state vanishes early,
// and an item that was added successfully sometimes "disappears" after an unrelated failure.
import { useRef, useState } from "react";
import { PlusIcon } from "lucide-react";
import api from "../api/axios";

const AddToCartControl = ({ product }) => {
  const [quantity, setQuantity] = useState(0);
  // FIX (busy): a boolean cannot describe overlapping requests; count them instead.
  const [pending, setPending] = useState(0);
  const [error, setError] = useState(null);

  // FIX: values that overlapping requests must share live in refs, so handlers never read a stale closure.
  const desired = useRef(0); // optimistic quantity (what the next click builds on)
  const confirmed = useRef(0); // last quantity acknowledged by the server
  const issued = useRef(0); // sequence number of the latest request sent
  const applied = useRef(0); // sequence number of the newest response applied
  const inFlight = useRef(0);

  // When nothing is pending any more, the UI shows exactly what the server confirmed.
  const settle = () => {
    inFlight.current -= 1;
    setPending(inFlight.current);
    if (inFlight.current === 0) {
      desired.current = confirmed.current;
      setQuantity(confirmed.current);
    }
  };

  const handleAdd = async () => {
    const seq = ++issued.current;
    inFlight.current += 1;
    setPending(inFlight.current);
    setError(null);

    // ROOT CAUSE (lost updates): the old code built the next quantity from the `quantity`
    // captured by the click handler's closure and snapshotted `previous` per click.
    desired.current += 1;
    setQuantity(desired.current);

    try {
      const { data } = await api.post("/cart/items", { productId: product._id, quantity: desired.current });
      // ROOT CAUSE (out of order): the old code applied every response. FIX: only a response that is
      // newer than the newest one already applied may update the confirmed quantity.
      if (seq > applied.current) {
        applied.current = seq;
        confirmed.current = data.quantity;
      }
    } catch (err) {
      // ROOT CAUSE (clobbering rollback): an older failing request used to restore its own stale
      // snapshot and undo a newer success. FIX: only the latest request's failure is surfaced,
      // and the UI is reconciled from `confirmed` in settle().
      if (seq === issued.current) {
        setError(err.response?.data?.message ?? "Could not update your cart.");
      }
    } finally {
      settle();
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
          aria-busy={pending > 0}
          className="rounded-full bg-app-green p-2 text-white shadow-md hover:bg-app-green-light active:scale-95"
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
      {pending > 0 && <p className="text-xs text-app-text-light">Saving…</p>}
      {error && (
        <p role="alert" className="text-xs font-semibold text-app-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default AddToCartControl;
