import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "add-to-cart-feedback",
  title: "Add to cart button double-adds, sticks on errors and flips back early",
  topic: "ui-states",
  difficulty: "medium",
  minutes: 25,
  summary: "Pending, success, error and reset states of an async Add to cart button.",
  scenario:
    "The new Add to cart button is meant to tell shoppers what is going on: \"Adding…\" while the request runs, \"Added ✓\" for a moment, then back to normal. In production it misbehaves. Impatient shoppers double-click and get two units. When the server rejects the request the button says \"Adding…\" forever. And if you add the same product twice within a couple of seconds, the second \"Added ✓\" vanishes almost immediately.\n\n" +
    "AddToCartButton takes an async onAdd(product) (the page wires it to the cart API) and a resetMs prop for how long the success state stays visible. The preview lets you make the next request fail so you can see every state.",
  inspiredBy: ["client/src/components/ProductCard.tsx", "client/src/store/useCartStore.ts", "client/src/pages/ProductPage.tsx"],
  editableFiles: ["src/components/AddToCartButton.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Click → \"Adding…\", the button is disabled and further clicks do not call onAdd again.",
    "onAdd resolves → \"Added ✓\" for resetMs milliseconds, then \"Add to cart\" again.",
    "onAdd rejects → \"Couldn't add — retry\", the button is enabled and a click retries.",
    "Adding again while \"Added ✓\" is showing restarts the countdown; an old timer never resets a newer success.",
    "Unmounting the button cancels any pending reset timer.",
  ],
  reproSteps: [
    "Press Run and double-click \"Add to cart\" quickly: the Requests counter jumps by 2.",
    "Tick \"Make the next request fail\" and click: the button stays on \"Adding…\" forever.",
    "Untick it, click once, wait about 1.2 s, then click again: the second \"Added ✓\" disappears after a fraction of a second.",
  ],
  acceptanceCriteria: [
    "A request in flight can never be duplicated by clicking again.",
    "Every outcome of onAdd (resolve / reject) leaves the button in a sensible state.",
    "Only the latest success timer can reset the button, and it is cleared on unmount.",
    "Labels exactly: \"Add to cart\", \"Adding…\", \"Added ✓\", \"Couldn't add — retry\".",
  ],
  edgeCases: [
    "Double click before the first render with \"Adding…\" has been painted",
    "A second success while the first success timer is still running",
    "Unmounting during the success state, or while the request is pending",
    "Retry after an error",
  ],
  hints: [
    "What does the button look like (and allow) between the click and the moment onAdd settles?",
    "A request can finish in two ways. Which of them does the handler currently describe?",
    "setTimeout returns an id. Keep it in a ref so a later success (or unmount) can clearTimeout the earlier one. Also ignore results that arrive after unmount.",
  ],
  explanation: {
    rootCause:
      "The handler flipped to \"pending\" but the button stayed clickable, so a second click started a second request. It only described the success path (no error state, so a rejection left it in \"pending\"). And each success created a timer that was never stored or cleared: the first timer still fired and reset the second success early, and it also fired after unmount.",
    fix: "Disable the button while pending and guard the handler, wrap onAdd in try/catch to reach an error state, keep the reset timer in a ref, clear it before starting a new one and in an unmount cleanup, and skip state updates once unmounted.",
    takeaways: [
      "An async action needs all four states: idle, pending, success and error.",
      "Disabled UI is not a guard; protect the handler too.",
      "Every timer you start needs an owner that can cancel it.",
    ],
  },
  expectedFailures: ["pending", "rejects", "restarts", "unmount"],
});
