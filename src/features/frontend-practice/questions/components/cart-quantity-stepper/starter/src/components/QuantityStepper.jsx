// src/components/QuantityStepper.jsx — extracted from Item_card in client/src/components/CartSideBar.tsx
// so the cart sidebar, the product page and the checkout summary can share it.
//
// Props: value (current quantity), min (default 1), max (units in stock), onChange(nextValue).
// The parent decides what a change means (CartItemCard calls the cart store's update_quantity).
//
// Reported by QA: see the ticket in the exercise statement.
import { PlusIcon, MinusIcon } from "lucide-react";

const QuantityStepper = ({ value, min = 1, max, onChange }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-app-cream px-1 py-0.5">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(value - 1)}
        disabled={value < min}
        className="rounded-full bg-gray-200 p-1 disabled:opacity-40"
      >
        <MinusIcon className="size-4" />
      </button>

      <span aria-label="Quantity" className="min-w-6 text-center text-sm font-semibold text-app-text">
        {value}
      </span>

      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        disabled={value > max}
        className="rounded-full bg-gray-200 p-1 disabled:opacity-40"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
};

export default QuantityStepper;
