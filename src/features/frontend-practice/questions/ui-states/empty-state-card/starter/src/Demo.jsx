// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch situations to check every wrapper; button clicks are logged to the Console tab.
import { useState } from "react";
import { InboxIcon } from "lucide-react";
import EmptyState from "./components/EmptyState";
import { EmptyCart, NoOrders, NoResults } from "./components/emptyStates";

const log = (what) => () => console.log("clicked:", what);

export default function Demo() {
  const [view, setView] = useState("cart");
  const [query, setQuery] = useState("bananas");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          ["cart", "Empty cart"],
          ["results", "No results"],
          ["orders", "No orders"],
          ["custom", "Custom (icon only)"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              view === key ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "results" && (
        <label className="flex items-center gap-2 text-sm">
          Query
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border border-app-border px-2 py-1"
            placeholder="try spaces or empty"
          />
        </label>
      )}

      {view === "cart" && <EmptyCart onContinue={log("Continue shopping")} />}
      {view === "results" && <NoResults query={query} onClear={log("Clear filters")} />}
      {view === "orders" && <NoOrders onBrowse={log("Start shopping")} onSupport={log("Need help?")} />}
      {view === "custom" && (
        <EmptyState
          icon={<InboxIcon className="size-12" />}
          title="Nothing saved yet"
          description="Tap the heart on a product to save it for later."
          actionLabel="Browse products"
          onAction={log("Browse products")}
        />
      )}
    </div>
  );
}
