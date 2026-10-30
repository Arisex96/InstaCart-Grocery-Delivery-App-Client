// src/Demo.jsx — read-only. The live preview renders this file's default export: a cart
// summary like the checkout page, driven by applyCoupons() from src/lib/coupons.js.
//
// Try it: untick every non-stackable coupon (BIG20, FLAT8), or tick all coupons, and
// compare the amounts with what you expect. Results are also logged to the Console tab.
import { useMemo, useState } from "react";
import { applyCoupons } from "./lib/coupons";
import { products } from "./data/products";

const items = [
  { product: products[0], quantity: 3 }, // bananas 1.20 x 3
  { product: products[1], quantity: 2 }, // milk 3.50 x 2
  { product: products[3], quantity: 1 }, // croissant 2.25
];

const COUPONS = [
  { code: "SAVE1", type: "fixed", value: 1, stackable: true },
  { code: "TEN", type: "percent", value: 10, stackable: true },
  { code: "BIG20", type: "percent", value: 20, stackable: false },
  { code: "FLAT8", type: "fixed", value: 8, stackable: false },
];

const NOW = new Date("2025-01-15T12:00:00Z");
const money = (n) => "$" + n.toFixed(2);

export default function Demo() {
  const [active, setActive] = useState(["SAVE1", "BIG20"]);
  const [cartItems, setCartItems] = useState(items);

  const result = useMemo(() => {
    const chosen = COUPONS.filter((c) => active.includes(c.code));
    const summary = applyCoupons(cartItems, chosen, NOW);
    console.log("applyCoupons", { coupons: active, ...summary });
    return summary;
  }, [active, cartItems]);

  const toggle = (code) =>
    setActive((list) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]));

  return (
    <div className="max-w-sm rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <h2 className="font-serif text-xl font-bold text-app-green">Order summary</h2>

      <fieldset className="mt-3 space-y-1">
        <legend className="text-xs font-bold uppercase tracking-wider text-app-text-light">Coupons</legend>
        {COUPONS.map((c) => (
          <label key={c.code} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active.includes(c.code)} onChange={() => toggle(c.code)} />
            <span className="font-semibold">{c.code}</span>
            <span className="text-app-text-light">
              {c.type === "percent" ? c.value + "%" : money(c.value)} {c.stackable ? "· stackable" : "· one only"}
            </span>
          </label>
        ))}
      </fieldset>

      <dl className="mt-4 space-y-1 border-t border-app-border pt-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{money(result.subtotal)}</dd>
        </div>
        {result.discounts.map((d) => (
          <div key={d.code} className="flex justify-between text-app-success">
            <dt>{d.code}</dt>
            <dd>-{money(d.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-app-border pt-2 text-base font-bold text-app-green">
          <dt>Total</dt>
          <dd data-testid="total">{money(result.total)}</dd>
        </div>
      </dl>

      <button
        onClick={() => setCartItems([])}
        className="mt-4 rounded-full border border-app-border px-4 py-1.5 text-sm hover:bg-app-cream"
      >
        Empty the cart
      </button>
    </div>
  );
}
