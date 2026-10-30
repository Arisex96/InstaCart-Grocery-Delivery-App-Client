import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "checkout-button-states",
  title: "Checkout lets shoppers order sold-out items and double-submit",
  topic: "ui-states",
  difficulty: "hard",
  minutes: 35,
  summary: "Derive disabled / pending / error / success states for the Place order action, and prevent duplicate orders.",
  scenario:
    "Ops found duplicate orders: shoppers on slow networks tap \"Place order\" twice. Others managed to order items that sold out after they added them to the cart (the API then rejects the order with a confusing error), and after a failed request the button said \"Place order\" but silently did nothing, because the hook was stuck in its submitting state. After a successful order the cart still contained the items.\n\n" +
    "CheckoutSummary and usePlaceOrder are trimmed from src/pages/Checkout.tsx, which already has an `if (submitting) return;` guard and an isPlacing prop. Derive the button's state properly from the cart and the request status.",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/CheckoutSummary.jsx", "src/hooks/usePlaceOrder.js"],
  shared: ["src/api/axios.js", "src/data/products.js", "src/store/useCartStore.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Empty cart: \"Your cart is empty\" and a disabled button.",
    "A sold-out item or a quantity above stock: the button is disabled and each problem is listed (\"<name> is out of stock\" / \"<name>: only <n> available (you have <q>)\").",
    "While the request is pending: the label is \"Placing order…\" and the button is disabled.",
    "Rapid double submits send exactly one POST /orders.",
    "On failure: the server message is shown in an alert, the hook returns to a retryable \"error\" status and the cart is untouched.",
    "On success: the cart is cleared and an \"Order placed\" confirmation with the order id is shown.",
  ],
  reproSteps: [
    "Press Run. The demo cart contains avocados (sold out) and 5 milk (only 3 in stock), yet \"Place order\" is enabled.",
    "Use the demo's \"Valid cart\" button, then click Place order twice quickly: the Console tab shows two POST requests.",
    "Tick \"Next order fails\" and place an order: after the error nothing indicates it can be retried, and after a success the cart is not emptied.",
  ],
  acceptanceCriteria: [
    "The button is enabled only when the cart is non-empty, every item is available, and no request is in flight.",
    "Each blocking reason is visible as text, not only as a greyed-out button.",
    "usePlaceOrder never sends two requests at once, even if called twice in the same tick.",
    "After a failure the hook status is \"error\" and a retry works; the error clears on the next attempt.",
    "After a success the cart store is cleared.",
  ],
  edgeCases: [
    "placeOrder called twice synchronously (before React re-renders)",
    "Retry after a failure",
    "An item with stock exactly equal to its quantity is allowed",
    "The cart changes while the confirmation is shown",
  ],
  hints: [
    "List every reason the button should be disabled. Which of them does `disabled={…}` currently account for?",
    "Disabling the button prevents clicks, but the hook can still be called twice in one tick before React re-renders. What survives between those two calls without waiting for a render?",
    "Trace the hook's status through the catch branch. What is it left at, and what should it be?",
  ],
  explanation: {
    rootCause:
      "The button's disabled flag only checked for an empty cart, so stock problems and in-flight requests never blocked it. The hook relied on state for its \"already submitting\" check (there was none) and never left the \"submitting\" status on failure, while the component never cleared the cart after success.",
    fix: "Derive `unavailable`, `isEmpty` and `isSubmitting` once and use them for the disabled flag, the label and the messages. In the hook, guard re-entry with a ref (updated synchronously), set status to \"error\" in the catch, clear the previous error at the start of a new attempt, and release the guard in `finally`. In the component, call clear_cart() when the order succeeds.",
    takeaways: [
      "Derive UI flags from state once; reuse them for disabled, label and messages.",
      "State is not readable synchronously: use a ref for \"in flight\" guards.",
      "Every async path (success, failure) must leave the status in a retryable state.",
    ],
  },
  expectedFailures: ["explains and disables when the cart is empty", "out-of-stock", "exceeds stock", "Placing order", "double submit", "status error", "clears the cart"],
});
