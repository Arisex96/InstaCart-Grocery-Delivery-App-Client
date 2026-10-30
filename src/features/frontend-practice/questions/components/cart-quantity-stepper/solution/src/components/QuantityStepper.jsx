// src/components/QuantityStepper.jsx — extracted from Item_card in client/src/components/CartSideBar.tsx
// so the cart sidebar, the product page and the checkout summary can share it.
//
// Props: value (current quantity), min (default 1), max (units in stock), onChange(nextValue).
// The parent decides what a change means (CartItemCard calls the cart store's update_quantity).
import { PlusIcon, MinusIcon } from "lucide-react";

// FIX: forward everything we do not own (...rest) and merge className, so callers
// can pass data-testid, aria-label, className… like they would to a plain <div>.
const QuantityStepper = ({ value, min = 1, max = Infinity, onChange, disabled = false, className = "", ...rest }) => {
  // ROOT CAUSE: the old checks were `value < min` / `value > max`. They only kicked in
  // AFTER the limit was crossed, so at value === max the + button still asked for max + 1
  // and at value === min the - button still asked for min - 1 (which removes the cart line).
  // FIX: the limit is reached when value EQUALS it.
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div {...rest} className={`inline-flex items-center gap-2 rounded-full bg-app-cream px-1 py-0.5 ${className}`.trim()}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => {
          if (!atMin) onChange(value - 1);
        }}
        disabled={disabled || atMin}
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
        onClick={() => {
          if (!atMax) onChange(value + 1);
        }}
        disabled={disabled || atMax}
        className="rounded-full bg-gray-200 p-1 disabled:opacity-40"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
};

export default QuantityStepper;
