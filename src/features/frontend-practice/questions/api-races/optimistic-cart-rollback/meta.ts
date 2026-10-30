import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "optimistic-cart-rollback",
  title: "Optimistic add-to-cart loses and resurrects quantities",
  topic: "api-races",
  difficulty: "hard",
  minutes: 40,
  summary: "Rapid clicks plus out-of-order or failed responses leave the displayed quantity out of sync with the server.",
  scenario:
    "To make the cart feel instant, AddToCartControl bumps the quantity locally and syncs it with POST /cart/items { productId, quantity } (an absolute quantity, not a delta). On a slow network, shoppers who tap + a few times in a row see the number jump back and forth, the busy spinner vanish while requests are still pending, and sometimes an item they successfully added \"disappears\" after an unrelated error.\n\n" +
    "The server rejects a quantity above the stock with 409 \"Only N in stock\". Whole Milk has only 3 units, so it is easy to trigger. Your job is to make the optimistic update correct when responses arrive late, out of order or fail.",
  inspiredBy: ["client/src/store/useCartStore.ts", "client/src/components/ProductCard.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/AddToCartControl.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Each click increments the shown quantity immediately and sends the new absolute quantity.",
    "The button reports aria-busy=\"true\" while ANY request is still pending.",
    "Responses that arrive out of order never lower the confirmed quantity: the newest acknowledged request wins.",
    "When everything has settled, the shown quantity equals the last quantity the server confirmed.",
    "If the latest request fails, the server's message is shown (role alert); a failure of an older request that a newer request superseded is not shown. The next click clears the message.",
  ],
  reproSteps: [
    "Press Run. The demo makes the first request slow (1.2 s) and the following ones fast.",
    "Click + twice quickly: the display shows 2, the fast response says 2 and then the slow one overwrites it with 1.",
    "Click + four times on Whole Milk (stock 3) and watch the busy state, the final quantity and the error message.",
  ],
  acceptanceCriteria: [
    "Quantity is optimistic while requests are pending and reconciles to the last confirmed value when all settle.",
    "A late, older response is ignored; an older failure does not undo a newer success.",
    "aria-busy stays true until the last pending request settles.",
    "A failure of the latest request rolls back to the last confirmed quantity and shows the server message.",
  ],
  edgeCases: [
    "Response 2 arrives before response 1",
    "Request 1 fails but request 2 succeeds",
    "Request 2 fails after request 1 succeeded",
    "Clicking again after an error clears the message immediately",
  ],
  hints: [
    "The handler captures `quantity` in a closure when the click happens. Which values does a second, overlapping click see?",
    "A single `saving` boolean cannot describe two overlapping requests. What do you need to count?",
    "Give every request a sequence number and remember the highest one that has been applied. Refs are handy for values that must survive across renders without triggering them.",
    "Decide what the UI should show once nothing is pending: it should come from the last confirmed value, not from whichever response happened to arrive last.",
  ],
  explanation: {
    rootCause:
      "The handler snapshots `previous` per click, sets the quantity from every response (`setQuantity(data.quantity)`), and uses one boolean for \"saving\". With overlapping requests those assumptions break: a slow older response overwrites a newer one, a failing older request rolls back to its stale snapshot and undoes a newer success, and the first response to finish clears the busy flag.",
    fix: "Track the optimistic target in a ref, give each request a sequence number, apply a success only if its sequence is newer than the last applied one, count pending requests instead of using a boolean, only surface (and only care about) the failure of the latest request, and when the pending count reaches zero set the displayed quantity to the last confirmed one.",
    takeaways: [
      "Overlapping async work needs ordering information (sequence numbers or tokens), not just flags.",
      "Roll back to the last server-confirmed state, not to a per-request snapshot.",
      "Send absolute values when requests can overlap: they are idempotent and order-insensitive on the server.",
    ],
  },
  expectedFailures: ["busy until every request", "older response", "older request"],
});
