// src/store/cartReducer.js — a useReducer port of client/src/store/useCartStore.ts.
// Item shape: { product, quantity }   Product: { _id, name, price, stock, ... }
// State shape: { items, total_items, total_price }
//
// Actions
//   { type: "add", product, quantity }
//   { type: "remove", productId }
//   { type: "update", productId, quantity }
//   { type: "clear" }
//
// QA found: repeat "Add" clicks do nothing visible, the item count is off after removing, stock is
// not enforced and "update" crashes for products that are not in the cart.

export const initialCartState = { items: [], total_items: 0, total_price: 0 };

const round2 = (n) => Math.round(n * 100) / 100;
const stockOf = (product) => product.stock ?? Infinity;

// FIX: totals are derived from the items in ONE place, so every branch stays consistent and the
// result is always a brand-new object. (Before, totals were bumped incrementally in "add" only,
// never touched by "remove"/"update", and never rounded.)
const withTotals = (items) => ({
  items,
  total_items: items.reduce((sum, it) => sum + it.quantity, 0),
  total_price: round2(items.reduce((sum, it) => sum + it.product.price * it.quantity, 0)),
});

export function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const { product, quantity } = action;
      if (!(quantity > 0)) return state;
      const found = state.items.find((it) => it.product._id === product._id);

      if (found) {
        // FIX (stock): cap at what is available.
        const next = Math.min(found.quantity + quantity, stockOf(product));
        if (next === found.quantity) return state; // already at the limit: nothing changed
        // ROOT CAUSE (no re-render): `found.quantity += n; return state` mutated the line and returned
        // the SAME object, so React saw Object.is(old, new) and skipped rendering.
        // FIX: map to a new array with a new line object.
        return withTotals(state.items.map((it) => (it === found ? { ...it, quantity: next } : it)));
      }

      const first = Math.min(quantity, stockOf(product));
      if (first <= 0) return state; // sold out
      return withTotals([...state.items, { product, quantity: first }]);
    }

    case "remove": {
      if (!state.items.some((it) => it.product._id === action.productId)) return state;
      return withTotals(state.items.filter((it) => it.product._id !== action.productId));
    }

    case "update": {
      const found = state.items.find((it) => it.product._id === action.productId);
      if (!found) return state; // FIX: used to crash on `undefined.quantity`
      if (action.quantity <= 0) {
        return withTotals(state.items.filter((it) => it !== found));
      }
      const next = Math.min(action.quantity, stockOf(found.product));
      return withTotals(state.items.map((it) => (it === found ? { ...it, quantity: next } : it)));
    }

    case "clear":
      return withTotals([]);

    default:
      return state;
  }
}
