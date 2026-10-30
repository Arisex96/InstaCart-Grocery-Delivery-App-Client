// src/components/QuantityInput.jsx — quantity control for the cart (see client/src/components/CartSideBar.tsx).
//
// Props: value (controlled), onChange(n), min (default 1), max (default Infinity)
import { useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";

const WHOLE_NUMBER = /^\d+$/;

const QuantityInput = ({ value, onChange, min = 1, max = Infinity }) => {
  // APPROACH: a number input cannot show "" or "1" on the way to "12", so the box keeps a DRAFT
  // string. The parent only ever hears about valid whole numbers inside [min, max].
  const [draft, setDraft] = useState(String(value));

  // The parent is the source of truth: follow it whenever it changes the value.
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const handleChange = (event) => {
    const text = event.target.value;
    setDraft(text);
    if (!WHOLE_NUMBER.test(text)) return; // "", "abc", "1.5" are just drafts
    const n = parseInt(text, 10);
    if (n >= min && n <= max && n !== value) onChange(n);
  };

  const handleBlur = () => {
    const text = draft.trim();
    if (!WHOLE_NUMBER.test(text)) {
      setDraft(String(value)); // revert invalid / empty text
      return;
    }
    const clamped = Math.min(max, Math.max(min, parseInt(text, 10)));
    // The parent value may not change (e.g. "99" -> already at max), so resync the draft ourselves.
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  const atMax = Number.isFinite(max) && value >= max;

  return (
    <div role="group" aria-label="Quantity selector" className="inline-flex flex-col items-start gap-1">
      <div className="inline-flex items-center rounded-full border border-app-border bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="rounded-full p-2 text-app-green hover:bg-app-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MinusIcon className="size-4" />
        </button>
        <input
          aria-label="Quantity"
          inputMode="numeric"
          value={draft}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-12 bg-transparent text-center text-sm font-semibold text-app-text"
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="rounded-full p-2 text-app-green hover:bg-app-cream disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
      <p role="status" className="min-h-4 text-xs font-medium text-app-warning">
        {atMax ? `Only ${max} in stock` : ""}
      </p>
    </div>
  );
};

export default QuantityInput;
