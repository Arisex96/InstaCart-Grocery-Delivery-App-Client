// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// Pick how the (fake) order request behaves. The payload your form sends is logged to the Console tab.
import { useRef, useState } from "react";
import CheckoutForm from "./components/CheckoutForm";

const ITEMS = [
  { product: { _id: "p1", name: "Organic Bananas", price: 1.2 }, quantity: 3 },
  { product: { _id: "p5", name: "Sourdough Loaf", price: 5.99 }, quantity: 2 },
  { product: { _id: "p12", name: "Extra Virgin Olive Oil", price: 11.99 }, quantity: 1 },
];

const MODES = {
  succeeds: "Succeeds",
  slow: "Slow (2 s)",
  fails: "Always fails",
  failsOnce: "Fails once",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Demo() {
  const [mode, setMode] = useState("succeeds");
  const [key, setKey] = useState(0);
  const attempts = useRef(0);

  const placeOrder = async (payload) => {
    attempts.current += 1;
    console.log("placeOrder called with", payload);
    await wait(mode === "slow" ? 2000 : 400);
    if (mode === "fails" || (mode === "failsOnce" && attempts.current === 1)) {
      throw new Error("Payment service unavailable");
    }
    return { id: "AB" + (1000 + attempts.current) };
  };

  return (
    <div className="mx-auto max-w-md space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-app-text-light">Order request:</span>
        {Object.entries(MODES).map(([value, label]) => (
          <button
            key={value}
            onClick={() => {
              attempts.current = 0;
              setMode(value);
              setKey((k) => k + 1); // fresh form for the new scenario
            }}
            className={`rounded-full border px-3 py-1 font-semibold ${
              mode === value ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <CheckoutForm key={key} items={ITEMS} placeOrder={placeOrder} />
    </div>
  );
}
