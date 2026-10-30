import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-grid-render-storm",
  title: "Typing in the search box re-renders every product row",
  topic: "architecture",
  difficulty: "hard",
  minutes: 40,
  summary: "Unrelated state and store changes re-render the whole grid. Fix it with memo, stable callbacks, useMemo and selectors.",
  scenario:
    "Profiling the Products page on a low-end Android phone shows that every keystroke in the search box, every unrelated cart change (like opening the cart drawer) and every \"add\" click re-renders all product rows, even though none of their data changed. With 200 products the UI stutters.\n\n" +
    "ProductBrowser mirrors that page: a search input, a shopper note field, a cart badge and a list of ProductRow components. Rows report each render through the `onRender(id)` prop so the render count is observable, both in the preview and in the tests. Make rows re-render only when something they display actually changes.",
  inspiredBy: [
    "client/src/components/ProductGrid.tsx",
    "client/src/pages/Products.tsx",
    "client/src/store/useCartStore.ts",
    "client/src/components/Navbar.tsx",
  ],
  editableFiles: ["src/components/ProductBrowser.jsx", "src/components/ProductRow.jsx"],
  shared: ["src/store/useCartStore.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Each row renders once on mount.",
    "Typing in the note field, or toggling the cart drawer in the store, re-renders no row.",
    "Adding a product updates the cart badge without re-rendering any row.",
    "Filtering by the search text re-renders no row that stays visible; hidden rows unmount, new ones mount.",
    "When one product's data changes, only that row re-renders.",
  ],
  reproSteps: [
    "Press Run: \"Row renders\" shows 6 (one per row).",
    "Type a letter in \"Note for shopper\": the counter jumps by 6 although no row changed.",
    "Click \"Toggle cart drawer\" (an unrelated store field) or press a + button: again every row re-renders.",
  ],
  acceptanceCriteria: [
    "Rows are memoised and receive referentially stable props.",
    "The cart store is read through selectors, so unrelated store updates do not re-render the browser.",
    "The filtered list is derived with useMemo from its real inputs.",
    "Behaviour is unchanged: search still filters case-insensitively and Add still adds one unit.",
  ],
  edgeCases: [
    "A parent re-render with the same `products` array",
    "A new products array that reuses the unchanged product objects",
    "Filtering that keeps some rows and removes others",
    "onRender is called from the row body and must be a stable prop too",
  ],
  hints: [
    "Whenever a component renders, so do all of its children, unless they opt out. Which tool tells React to skip a child whose props are shallowly equal?",
    "Memoisation only works if the props really are equal. Which props of ProductRow change identity on every parent render?",
    "Calling `useCartStore()` without a selector subscribes to the entire store. What would you select instead?",
    "The filtered list is recomputed on every render. Which values does it truly depend on?",
  ],
  explanation: {
    rootCause:
      "ProductBrowser subscribed to the whole zustand store (`useCartStore()`), so any store change re-rendered it, and every render created a new filtered array and a new inline `onAdd` closure. ProductRow was a plain component, so React re-rendered all rows whenever their parent did, regardless of unchanged data.",
    fix: "Wrap ProductRow in React.memo, select only `total_items` and `add_item` from the store, create a stable `handleAdd` with useCallback, and derive the visible products with useMemo([products, query]). The memoised rows then see identical props and are skipped.",
    takeaways: [
      "React.memo only helps when props are stable: stabilise callbacks (useCallback) and derived objects (useMemo).",
      "Subscribe to the smallest slice of a store with a selector.",
      "Make render counts observable (a callback in the body) so you can prove an optimisation.",
    ],
  },
  expectedFailures: ["note field", "unrelated store", "cart badge", "stays visible", "only the row"],
});
