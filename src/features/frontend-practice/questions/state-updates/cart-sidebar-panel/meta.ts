import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-sidebar-panel",
  title: "Build the cart panel connected to the cart store",
  topic: "state-updates",
  difficulty: "medium",
  kind: "build",
  minutes: 35,
  summary: "A store-connected cart: lines, stock-aware stepper, remove, subtotal, clear and empty state.",
  scenario:
    "The cart sidebar is being rebuilt. Design wants a compact panel that lists everything in the cart, lets shoppers change quantities without ever exceeding stock, remove lines, clear the whole cart, and shows a friendly empty state.\n\n" +
    "The cart lives in the zustand store (src/store/useCartStore.js, read-only here): `items`, `total_items`, `total_price`, `update_quantity(id, qty)`, `remove_item(id)` and `clear_cart()`. Implement CartPanel in src/components/CartPanel.jsx. The Demo has buttons that add sample products to the store, and the Target UI tab shows the finished panel.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/CartPanel.jsx"],
  shared: ["src/data/products.js", "src/store/useCartStore.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A <section aria-label=\"Cart\"> with an <h2> reading \"Your cart (N items)\" (\"Your cart (1 item)\" for exactly one unit; N is the total number of units, not lines).",
    "One <li> per cart line inside a <ul>: the product image (alt = product name), the name, \"$<price> / <unit>\" (two decimals, e.g. \"$1.20 / 1 lb\") and the line total (\"$3.60\").",
    "Stepper per line: a button aria-label \"Decrease quantity of <name>\", the quantity in an element with aria-label \"Quantity of <name>\", and a button aria-label \"Increase quantity of <name>\". Increase is disabled once the quantity reaches the product's stock. Decrease at quantity 1 removes the line.",
    "A remove button per line with aria-label \"Remove <name>\".",
    "A footer description list with a \"Subtotal\" <dt> and the cart total <dd> (\"$12.34\"), and a \"Clear cart\" button that empties the cart.",
    "Empty cart: the text \"Your cart is empty\" and a \"Continue shopping\" button that calls the onContinue prop; no subtotal and no Clear cart button.",
  ],
  expectedBehavior: [
    "The panel always reflects the store, including changes made from elsewhere (e.g. an Add to cart button on another component).",
    "Quantities can never exceed a product's stock through the stepper.",
    "Every amount is shown with two decimals without floating point noise.",
  ],
  reproSteps: [
    "Press Run and use the Demo buttons (Add bananas, Add milk, Add dark chocolate) to put products in the store; the panel is only a stub.",
    "Open the Target UI tab to see the finished panel and try its stepper, remove and clear buttons.",
    "Click + on the milk until it stops (stock is 3), then click − down to zero to see the line disappear.",
  ],
  acceptanceCriteria: [
    "Header count, line totals and subtotal are correct and update with every change.",
    "Increase is disabled at stock; decrease at quantity 1 removes the line; Remove and Clear cart work.",
    "The panel re-renders when the store changes elsewhere (subscribe with selectors).",
    "Empty state with a working Continue shopping button.",
  ],
  edgeCases: [
    "exactly one unit (\"1 item\")",
    "quantity equal to stock (increase disabled)",
    "1.2 × 3 (floating point)",
    "clearing the cart while lines exist",
    "an item added to the store after the panel rendered",
  ],
  hints: [
    "Read state with selectors, e.g. `useCartStore((s) => s.items)`, so the panel re-renders when the store changes; never copy items into local state.",
    "The store already clamps and removes at 0: stepping down is `update_quantity(id, quantity - 1)`. You only need to disable + at stock.",
    "Format money in one tiny helper (`n.toFixed(2)`) and use it for the line total and subtotal. Use `total_items` for the header and `total_price` for the subtotal.",
  ],
  explanation: {
    rootCause:
      "There is no bug: this is a build exercise. The main trap is keeping a second copy of the cart in component state, which goes stale as soon as anything else changes the store.",
    fix: "Subscribe to the store with selectors, derive everything (count, line totals, subtotal) from `items`/store totals during render, call the store actions from the buttons, and disable the + button when `quantity >= product.stock`.",
    takeaways: [
      "Treat the store as the single source of truth; derive, do not copy.",
      "Select only what you need from a zustand store.",
      "Disabled controls need an accessible name that says which item they act on.",
    ],
  },
  expectedFailures: ["header", "line", "increase", "remove", "clear", "empty"],
});
