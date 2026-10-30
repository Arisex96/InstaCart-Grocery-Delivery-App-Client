import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "add-to-cart-button-tests",
  title: "Test the add-to-cart stepper with Testing Library",
  topic: "testing-ai",
  difficulty: "medium",
  mode: "write-tests",
  minutes: 30,
  summary: "Write React Testing Library tests for a quantity stepper wired to the cart store.",
  scenario:
    "The product page's quantity stepper and \"Add to cart\" button were rewritten with an AI assistant. It looks fine in the browser, but nobody wrote tests, and the last two regressions (adding more than the stock, and a button that stayed enabled for sold-out items) were found by customers.\n\n" +
    "Write Testing Library tests for AddToCartButton. Your file is run against the real component (it must pass) and against copies with one bug planted in each (your suite must fail on every one). Test behaviour a shopper sees — roles, labels, text and the cart store — not implementation details.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/store/useCartStore.ts", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/__tests__/AddToCartButton.test.jsx"],
  shared: ["src/store/useCartStore.js", "src/data/products.js"],
  expectedBehavior: [
    "Your tests pass against the untouched AddToCartButton.",
    "Every planted bug makes at least one of your tests fail.",
  ],
  reproSteps: [
    "Open the src/components/AddToCartButton.jsx tab and read the rules in its header.",
    "Press Run Tests with the starter: it passes against the real component but several seeded bugs are not caught.",
    "For one uncaught bug, write the user interaction that would expose it (click + a few times, add to the cart, ...) and assert on what the shopper or the cart should see.",
  ],
  acceptanceCriteria: [
    "Queries use accessible roles/names (getByRole with name) where possible.",
    "Cart assertions read useCartStore.getState().",
    "Every seeded bug is caught; the suite is green on the real component.",
    "Each test sets up its own state (the store is cleared in beforeEach).",
  ],
  edgeCases: [
    "Clicking + more times than the stock allows (milk has 3)",
    "Clicking - at 1",
    "Adding a quantity greater than 1",
    "A product with stock 0",
  ],
  hints: [
    "Use screen.getByRole('button', { name: ... }). If a button has no usable accessible name, the test (and a screen reader) cannot find it.",
    "To check a limit, click past it: more clicks than the stock, and more clicks down than the starting value.",
    "To check what was added, click + a couple of times, then press Add to cart and read useCartStore.getState().items. Then check what the selector shows afterwards.",
  ],
  explanation: {
    rootCause:
      "A test that only checks that the button renders cannot fail for any behavioural change. The stepper rules (limits, selected quantity, reset, sold-out state) are all untested, so planted bugs in each of them slip through.",
    fix: "Drive the component like a user (fireEvent/userEvent on role-queried buttons), assert on the visible quantity and on the cart store, and cover each rule with an input that crosses its boundary: past the stock, below 1, quantity > 1, after an add, and a sold-out product.",
    takeaways: [
      "Query by role and accessible name: it tests the UI the way shoppers and assistive tech use it.",
      "Cover limits by crossing them, not by staying inside them.",
      "Reset shared state (the store) before each test so tests do not depend on order.",
    ],
  },
  mutants: [
    {
      name: "Catches a missing stock limit",
      file: "src/components/AddToCartButton.jsx",
      find: "Math.min(product.stock, q + 1)",
      replace: "q + 1",
      hint: "Click + more times than the product has units.",
    },
    {
      name: "Catches a wrong lower limit",
      file: "src/components/AddToCartButton.jsx",
      find: "Math.max(1, q - 1)",
      replace: "Math.max(0, q - 1)",
      hint: "Click - while the selector shows 1.",
    },
    {
      name: "Catches a problem with the amount added to the cart",
      file: "src/components/AddToCartButton.jsx",
      find: "add_item(product, quantity);",
      replace: "add_item(product, 1);",
      hint: "Select more than one unit before adding.",
    },
    {
      name: "Catches a problem with what happens after adding",
      file: "src/components/AddToCartButton.jsx",
      find: "setQuantity(1);",
      replace: "",
      hint: "Look at the selector right after pressing Add to cart.",
    },
    {
      name: "Catches a problem with the sold-out state",
      file: "src/components/AddToCartButton.jsx",
      find: "disabled={outOfStock}",
      replace: "disabled={false}",
      hint: "Render a product whose stock is 0 and inspect the button.",
    },
    {
      name: "Catches inaccessible button labels",
      file: "src/components/AddToCartButton.jsx",
      find: "aria-label=\"Increase quantity\"",
      replace: "aria-label=\"\"",
      hint: "Find the + button by its accessible name.",
    },
  ],
  expectedFailures: ["stock limit", "lower limit", "amount added", "after adding", "sold-out", "inaccessible"],
});
