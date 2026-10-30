import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-grid-empty-state",
  title: "Products page shows a blank grid instead of \"No Products Found\"",
  topic: "ui-states",
  difficulty: "easy",
  minutes: 15,
  summary: "ProductGrid checks the wrong list for its empty state and its reset button crashes without a handler.",
  scenario:
    "On the Products page, picking a category and typing a search that matches nothing leaves shoppers staring at a blank white area: no message, no way back. The \"No Products Found\" card with the Inbox icon only ever appears when the whole catalogue is empty.\n\n" +
    "Support also saw a crash on the home page \"Featured\" row, which renders ProductGrid without an onResetFilters handler: the Clear All Filters button is still drawn and clicking it throws. This is a trimmed copy of src/components/ProductGrid.tsx.",
  inspiredBy: ["client/src/components/ProductGrid.tsx", "client/src/pages/Products.tsx"],
  editableFiles: ["src/components/ProductGrid.jsx"],
  shared: ["src/data/products.js", "src/store/useCartStore.js", "src/components/ProductCard.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "When the active filters leave no products, the grid shows the \"No Products Found\" card.",
    "The card is announced to screen readers (role=\"status\").",
    "\"Clear All Filters\" is rendered only when an onResetFilters handler is passed, and calls it once when clicked.",
    "When at least one product matches, only the product cards are shown.",
  ],
  reproSteps: [
    "Press Run. The preview starts with the search \"no-such-item\", which matches nothing.",
    "Notice the blank area where the grid should be: no message and no reset button.",
    "Switch the first dropdown to \"Featured row (no reset handler)\". The area is still blank. After you fix the empty card, come back here: in this mode there is no reset handler, so the card must not offer a Clear All Filters button (clicking it used to throw a TypeError).",
  ],
  acceptanceCriteria: [
    "The empty state is driven by the filtered list, not the raw products prop.",
    "The empty card has role=\"status\".",
    "No reset button without a handler; with a handler it is called exactly once per click.",
    "Cards still render normally when filters match.",
  ],
  edgeCases: [
    "An empty catalogue (products = [])",
    "A category that exists but has no matching search results",
    "No onResetFilters prop",
  ],
  hints: [
    "Which variable does the component check before returning the empty card: the prop it received or the list it computed?",
    "An optional callback should be treated as optional everywhere it is used — including deciding whether to draw the button at all.",
    "A status message that appears after interaction needs a live-region role so assistive tech announces it.",
  ],
  explanation: {
    rootCause:
      "The empty-state branch tests `products.length` (the raw prop) instead of the filtered `processedProducts.length`, so a non-empty catalogue with no matches renders an empty grid. The reset button is drawn unconditionally and calls `onResetFilters()` without checking that it exists.",
    fix: "Branch on `processedProducts.length === 0`, render the button only when `onResetFilters` is provided, and give the card role=\"status\".",
    takeaways: [
      "Check the derived value you actually render, not the input it was derived from.",
      "Optional callbacks gate both the UI that uses them and the call itself.",
      "Empty and error cards are status messages: give them a role.",
    ],
  },
  expectedFailures: ["No Products Found when the filters", "announces", "hides Clear All Filters"],
});
