// src/components/AddToCartButton.jsx — the button on the product page (see client/src/pages/ProductPage.tsx)
// with the feedback states product wants: pending, success, error.
//
// Props
//   product   the product to add
//   onAdd     async (product) => void   rejects when the server refuses (e.g. out of stock)
//   resetMs   how long the success state stays visible before returning to "Add to cart"
//
// Labels used by QA scripts: "Add to cart", "Adding…", "Added ✓", "Couldn't add — retry"
import { useState } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";

const AddToCartButton = ({ product, onAdd, resetMs = 1500 }) => {
  const [status, setStatus] = useState("idle"); // idle | pending | success | error

  const handleClick = async () => {
    setStatus("pending");
    try {
      await onAdd(product);
      setStatus("success");
      // go back to the normal label after a moment
      setTimeout(() => setStatus("idle"), resetMs);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  const label =
    status === "pending" ? "Adding…" : status === "success" ? "Added ✓" : status === "error" ? "Couldn't add — retry" : "Add to cart";

  return (
    <button
      onClick={handleClick}
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
