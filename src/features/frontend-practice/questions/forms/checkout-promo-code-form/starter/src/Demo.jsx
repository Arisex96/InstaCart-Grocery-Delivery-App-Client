// src/Demo.jsx — read-only. The live preview renders this file's default export.
// A tiny stand-in for the checkout order summary: valid codes are FRESH10 (10% off)
// and FREESHIP (free delivery). Anything else is "not valid".
import { useState } from "react";
import PromoCodeForm from "./components/PromoCodeForm";

const SUBTOTAL = 24.5;
const DELIVERY = 3.99;

export default function Demo() {
  const [applied, setApplied] = useState(null);
  const [lastSent, setLastSent] = useState(null);

  const handleApply = (code) => {
    setLastSent(code);
    if (code === "FRESH10" || code === "FREESHIP") {
      setApplied(code);
      return undefined;
    }
    return "Promo code not valid";
  };

  const discount = applied === "FRESH10" ? SUBTOTAL * 0.1 : 0;
  const delivery = applied === "FREESHIP" ? 0 : DELIVERY;
  const total = SUBTOTAL - discount + delivery;

  return (
    <div className="max-w-sm space-y-4">
      <PromoCodeForm onApply={handleApply} />
      <div className="space-y-1 rounded-2xl border border-app-border bg-white p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${SUBTOTAL.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{delivery === 0 ? "Free" : "$" + delivery.toFixed(2)}</span>
        </div>
        {applied && (
          <div className="flex justify-between text-app-success">
            <span>Promo {applied}</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-app-border pt-2 font-bold text-app-green">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-xs text-app-text-light">
        Last code sent: <code>{lastSent === null ? "(none)" : JSON.stringify(lastSent)}</code>
      </p>
    </div>
  );
}
