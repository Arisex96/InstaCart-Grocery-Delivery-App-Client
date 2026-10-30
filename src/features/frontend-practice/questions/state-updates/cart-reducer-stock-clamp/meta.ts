import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-reducer-stock-clamp",
  title: "Cart reducer mutates state, skips re-renders and ignores stock",
  topic: "state-updates",
  difficulty: "medium",
  minutes: 30,
  summary: "A useReducer cart mutates its state in place: repeat adds do not re-render, totals drift and stock is ignored.",
  scenario:
    "The checkout team is moving the cart from the zustand store to a plain useReducer so it can be unit-tested without a store. The first port has problems: pressing \"Add\" on a product that is already in the cart changes nothing on screen until something else re-renders; the item count in the header is wrong after removing an item; shoppers can add 10 cartons of milk when only 3 are in stock; and changing a quantity for a product that has just been removed throws.\n\n" +
    "The reducer must keep the behaviour of client/src/store/useCartStore.ts: items are { product, quantity }, quantities never exceed product.stock, a quantity of 0 removes the line, and total_items / total_price always match the items (price rounded to cents). Actions: { type: \"add\", product, quantity }, { type: \"remove\", productId }, { type: \"update\", productId, quantity }, { type: \"clear\" }.",
  inspiredBy: ["client/src/store/useCartStore.ts", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/store/cartReducer.js"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Reducers are pure: they never modify the state or the items they receive and return a new state object when something changed.",
    "add: merges into an existing line, caps the quantity at product.stock and ignores sold-out products.",
    "update: sets the quantity (capped at stock); a quantity of 0 or less removes the line.",
    "Totals (total_items, total_price rounded to cents) are recomputed for every change; unknown products and unknown actions leave the state untouched.",
  ],
  reproSteps: [
    "Press Run, click \"Add Organic Bananas\" twice: the line quantity stays at 1 on screen.",
    "Click \"Add Whole Milk\" five times (stock is 3): the cart happily shows more than 3.",
    "Add two products, then remove one with the trash button: \"Items\" in the summary is wrong.",
  ],
  acceptanceCriteria: [
    "Dispatching on a deeply frozen state does not throw: nothing is mutated.",
    "A change to an existing line produces a new state object, so React re-renders.",
    "Quantities never exceed stock; sold-out products are ignored.",
    "total_items and total_price (to the cent) match the items after add, update, remove and clear.",
  ],
  edgeCases: [
    "adding more than the remaining stock only adds what fits",
    "update to 0 or a negative number removes the line",
    "update/remove for a product that is not in the cart",
    "unknown action type",
  ],
  hints: [
    "Object.freeze the state in a test: which lines of the reducer would throw? Every one of them is a mutation.",
    "React compares the new state to the old one with Object.is. If you modify an object and return the same object, what does React conclude?",
    "Write one helper that takes a list of items and returns a complete new state (items plus both totals) and use it in every branch.",
  ],
  explanation: {
    rootCause:
      "The reducer pushed into state.items, did `found.quantity += n` and incremented the totals on the state it received. Mutating an existing line and returning the same `state` object makes React bail out of the re-render (Object.is says nothing changed), and incremental totals drifted: they were not updated by remove/update at all and float arithmetic was never rounded. Stock was never consulted.",
    fix: "Never touch the incoming state: build new item arrays with map/filter/spread, compute totals from the new items in one helper (rounded to cents), clamp quantities with Math.min(quantity, stock), and return the original state only when nothing changed (unknown product/action).",
    takeaways: [
      "A reducer is a pure function: (state, action) → new state, with no mutation and no side effects.",
      "Derive totals from the items instead of maintaining them incrementally.",
      "Returning the same reference means \"nothing changed\"; return a new object whenever something did.",
    ],
  },
  expectedFailures: ["does not mutate", "new state object", "re-renders", "stock", "totals"],
});
