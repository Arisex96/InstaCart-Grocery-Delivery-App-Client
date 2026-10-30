// src/components/AddToCartButton.jsx — the button on the product page (see client/src/pages/ProductPage.tsx)
// with the feedback states product wants: pending, success, error.
//
// Props
//   product   the product to add
//   onAdd     async (product) => void   rejects when the server refuses (e.g. out of stock)
//   resetMs   how long the success state stays visible before returning to "Add to cart"
//
// Labels used by QA scripts: "Add to cart", "Adding…", "Added ✓", "Couldn't add — retry"
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";

const AddToCartButton = ({ product, onAdd, resetMs = 1500 }) => {
  const [status, setStatus] = useState("idle"); // idle | pending | success | error
  const resetTimer = useRef(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    // FIX (leak): the pending reset timer is owned by this component, so cancel it on unmount.
    return () => {
      mounted.current = false;
      clearTimeout(resetTimer.current);
    };
  }, []);

  const handleClick = async () => {
    // FIX (double add): disabling the button is not enough (two clicks can land before React
    // re-renders), so the handler guards itself too.
    if (inFlight.current) return;
    inFlight.current = true;
    // FIX (stale timer): a new attempt invalidates the previous success timer.
    clearTimeout(resetTimer.current);
    setStatus("pending");
    try {
      await onAdd(product);
      if (!mounted.current) return;
      setStatus("success");
      resetTimer.current = setTimeout(() => setStatus("idle"), resetMs);
    } catch (err) {
      // ROOT CAUSE (stuck on error): only the success path was described, so a rejection
      // left the status on "pending". FIX: the error is a state of its own.
      console.error("Add to cart failed", err);
      if (mounted.current) setStatus("error");
    } finally {
      inFlight.current = false;
    }
  };

  const label =
    status === "pending" ? "Adding…" : status === "success" ? "Added ✓" : status === "error" ? "Couldn't add — retry" : "Add to cart";

  return (
    <button
      onClick={handleClick}
      disabled={status === "pending"}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-60 ${
        status === "success" ? "bg-app-success" : status === "error" ? "bg-app-error" : "bg-app-green hover:bg-app-green-light"
      }`}
    >
      {status === "pending" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : status === "success" ? (
        <Check className="size-4" />
      ) : (
        <ShoppingCart className="size-4" />
      )}
      {label}
    </button>
  );
};

export default AddToCartButton;
