import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-sidebar-summary",
  title: "Cart sidebar says \"2 items\" for 5 units and shows $3.5999999",
  topic: "ui-states",
  difficulty: "easy",
  minutes: 15,
  summary: "CartSummary miscounts items, prints raw floats and offers Checkout for an empty cart.",
  scenario:
    "Three reports landed on the same sidebar. A shopper with 3 bananas and 2 milks sees \"Your cart (2 items)\" in the header. Another sees a subtotal of $3.5999999999999996. And someone who removed everything still gets a perfectly clickable Checkout button next to a blank panel, with no hint that the cart is empty.\n\n" +
    "CartSummary is a trimmed copy of the panel inside src/components/CartSideBar.tsx. It receives the cart items as props (same { product, quantity } shape as the zustand store) and an onCheckout callback. Fix every state it can be in: empty, one unit, several units.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/CartSummary.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Empty cart: shows \"Your cart is empty\", no subtotal row, and a disabled Checkout button that never calls onCheckout.",
    "The header counts units, not lines: 3 bananas + 2 milks → \"Your cart (5 items)\"; exactly one unit → \"Your cart (1 item)\".",
    "Line totals and the subtotal are formatted with two decimals: \"$2.40\", \"$3.60\".",
    "A non-empty cart has an enabled Checkout button that calls onCheckout once per click.",
  ],
  reproSteps: [
    "Press Run. Click \"Add bananas\" three times: the header says \"(1 items)\" and the line total reads \"$3.5999999999999996\".",
    "Click \"Add milk\" once: the header says \"(2 items)\" although the cart holds 4 units.",
    "Click \"Clear cart\": the panel is blank, yet Checkout is still enabled.",
  ],
  acceptanceCriteria: [
    "The count in the header equals the sum of the quantities, with correct singular/plural wording.",
    "Every money value is shown with exactly two decimals.",
    "The empty state is explicit and Checkout is disabled while there is nothing to buy.",
    "Non-empty carts keep working: each line shows name, quantity and its line total.",
  ],
  edgeCases: [
    "Exactly one unit of one product (\"1 item\")",
    "Prices such as 1.2 × 3 that are not exact in binary floating point",
    "An empty items array",
  ],
  hints: [
    "Which array method counts the entries of a list, and which one adds up their quantities?",
    "Plural wording depends on the number of units, not on the number of cart lines.",
    "Number#toFixed(2) is the quickest way to format money; derive the empty state once (e.g. `const isEmpty = items.length === 0`) and reuse it for the message, the subtotal and the button.",
  ],
  explanation: {
    rootCause:
      "The header used `items.length` (cart lines) instead of the sum of quantities, never handled the singular, and interpolated raw numbers: 1.2 * 3 is 3.5999999999999996 in binary floating point. The component also had no empty branch, so an empty cart rendered an empty panel with an enabled Checkout button.",
    fix: "Sum the quantities for the count and pick the singular/plural word from it, format every price with toFixed(2), and derive an isEmpty flag that switches to an explicit message, hides the subtotal and disables the button.",
    takeaways: [
      "Count what the user thinks they are counting (units), not what the data structure stores (lines).",
      "Format money at the edge, in one place, with a fixed number of decimals.",
      "Model every state of a panel explicitly: empty, one, many.",
    ],
  },
  expectedFailures: ["counts units", "two decimals", "empty cart", "singular"],
});
