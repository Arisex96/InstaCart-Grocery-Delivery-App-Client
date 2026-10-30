// src/components/PromoCodeForm.jsx — the "Have a promo code?" box in the checkout order summary
// (styled like the cards in client/src/pages/Checkout.tsx).
//
// Props
//   onApply(code)  called with the code the shopper wants to use. It may return a string: that is an
//                  error message from the server ("Promo code expired"). Returning nothing means success.
//   applying       true while the parent is validating the code with the server
//
// QA bounced the first version: "I can't type in the box", "Enter reloads the page",
// "Apply with an empty box sends an empty code".
import { useState } from "react";

const PromoCodeForm = ({ onApply, applying = false }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // FIX (typing): a controlled input needs an onChange that writes the new value back to state.
  // Editing also clears the previous error.
  const handleChange = (event) => {
    setCode(event.target.value);
    setError("");
  };

  const handleSubmit = (event) => {
    // ROOT CAUSE (reload): a <form> submit navigates by default. FIX: stop it, we handle it in JS.
    event.preventDefault();

    // FIX (validation): normalise once and use the result for the check AND the call.
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Enter a promo code");
      return;
    }

    // The parent may answer with an error message (invalid / expired code).
    const message = onApply(normalized);
    if (typeof message === "string") setError(message);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Promo code" className="rounded-2xl border border-app-border bg-white p-4">
      <label htmlFor="promo-code" className="mb-2 block text-sm font-semibold text-app-text">
        Promo code
      </label>
      <div className="flex gap-2">
        {/* ROOT CAUSE (can't type): `value` without `onChange` made React ignore every keystroke. */}
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={handleChange}
          placeholder="e.g. FRESH10"
          className="min-w-0 flex-1 rounded-xl border border-app-border bg-app-cream px-3 py-2 text-sm uppercase"
        />
        <button
          type="submit"
          disabled={applying}
          className="rounded-full bg-app-green px-5 py-2 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-50"
        >
          {applying ? "Applying…" : "Apply"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-app-error">
          {error}
        </p>
      )}
    </form>
  );
};

export default PromoCodeForm;
