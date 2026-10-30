import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "quantity-batching",
  title: "\"+3\" adds one and the added counter loses updates",
  topic: "state-updates",
  difficulty: "medium",
  minutes: 25,
  summary: "Several setState calls in one handler read the same stale value; a counter updated after await loses increments.",
  scenario:
    "The product page got a quantity picker with a quick-add button \"+3\" for shoppers who buy in bulk. In production \"+3\" only ever adds one unit, and it can overshoot the stock when it does work. A second report concerns the \"Added this visit\" counter under the picker: when a shopper taps \"Add to cart\" twice quickly (the API call takes a moment), the counter shows fewer units than were really added.\n\n" +
    "ProductQuantityPicker keeps the quantity and the running total in local state. onAdd(product, quantity) is the async call that talks to the cart API; it resolves when the server confirmed.",
  inspiredBy: ["client/src/components/ProductCard.tsx", "client/src/store/useCartStore.ts", "client/src/pages/ProductPage.tsx"],
  editableFiles: ["src/components/ProductQuantityPicker.jsx"],
  shared: ["src/store/useCartStore.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "\"+\" adds one; \"+3\" adds three, but the quantity never exceeds the product's stock.",
    "\"+\" and \"+3\" are disabled once the quantity equals the stock.",
    "\"Add to cart\" calls onAdd(product, quantityAtClickTime) and resets the picker to 1 right away.",
    "\"Added this visit\" equals the sum of all confirmed additions, however the confirmations are interleaved.",
  ],
  reproSteps: [
    "Press Run. In the preview, click \"+3\" on the Whole Milk picker (stock 3): the quantity becomes 2, not 3.",
    "On the Organic Bananas picker, click \"+3\": 1 → 2.",
    "Click \"+\" twice and then \"Add to cart\" twice within a second (the demo API takes 1.2 s). Wait: the total only counts one of the two additions.",
  ],
  acceptanceCriteria: [
    "\"+3\" adds exactly three (clamped to stock) in one click.",
    "The total is the sum of all confirmed additions even when confirmations overlap.",
    "The picker never shows a quantity above stock or below 1.",
    "Existing behaviour (single +, add, reset) is unchanged.",
  ],
  edgeCases: [
    "quantity 3 with stock 5 and \"+3\" → 5",
    "stock of 1",
    "two Add clicks before the first onAdd resolves",
  ],
  hints: [
    "Within one render, `qty` is a constant. What value does `qty + 1` produce each time it is evaluated in the same handler?",
    "Pass an updater function to the setter: setQty(q => ...) receives the latest queued value, so queued updates build on each other.",
    "The same problem exists after `await`: the closure still holds the value from the render in which the click happened. Update the total with a functional update too.",
  ],
  explanation: {
    rootCause:
      "State variables are snapshots of one render. In `setQty(qty + 1); setQty(qty + 1); setQty(qty + 1)` all three calls compute the same value from the same snapshot, so React (which batches them) ends up with qty + 1. For the same reason `setAddedTotal(addedTotal + added)` after an `await` uses the snapshot of the render in which the handler started, so two overlapping handlers overwrite each other instead of accumulating.",
    fix: "Use functional updates: setQty(q => Math.min(stock, q + 3)) and setAddedTotal(total => total + added). The updater receives the latest pending state, so batched and asynchronous updates compose, and clamping lives in one place.",
    takeaways: [
      "When the next state depends on the previous one, use the updater form of the setter.",
      "A render's variables never change; async callbacks see old snapshots.",
      "React batches updates in event handlers (and everywhere since React 18), so \"read my own write\" assumptions do not hold.",
    ],
  },
  expectedFailures: ["adds three", "stock", "overlapping"],
});
