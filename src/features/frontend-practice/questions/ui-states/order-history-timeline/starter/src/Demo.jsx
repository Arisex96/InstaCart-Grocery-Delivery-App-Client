// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch the data scenario to check every state of your OrderHistory.
import { useState } from "react";
import OrderHistory from "./components/OrderHistory";
import { NOW, orders } from "./data/orders";

const SCENARIOS = {
  "All orders": orders,
  "Only delivered": orders.filter((o) => o.status === "delivered"),
  "No orders yet": [],
};

export default function Demo() {
  const [name, setName] = useState("All orders");
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(SCENARIOS).map((key) => (
          <button
            key={key}
            onClick={() => setName(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              key === name ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {key}
          </button>
        ))}
        <span className="self-center text-xs text-app-text-light">"Today" is 10 Mar 2026 in this demo</span>
      </div>
      <OrderHistory orders={SCENARIOS[name]} now={NOW} />
    </div>
  );
}
