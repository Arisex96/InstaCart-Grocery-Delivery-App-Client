import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-context-split",
  title: "Typing in the search box re-renders the whole cart UI",
  topic: "architecture",
  difficulty: "medium",
  minutes: 30,
  summary: "A cart context whose value changes on every render makes every consumer re-render; split state from actions.",
  scenario:
    "The shop shell wraps the page in a CartProvider (the team is evaluating moving off the zustand store in client/src/store/useCartStore.ts). Profiling shows that every keystroke in the search box re-renders the cart badge and every product row, even though nothing about the cart changed. Adding a product also re-renders every row, although rows only need the \"add\" function.\n\n" +
    "The consumers (CartBadge, ProductRow) are already memoised and must not change. All the fixing happens in the context module: how the provider builds and exposes its value, and what the two hooks useCartState and useCartActions return.",
  inspiredBy: ["client/src/store/useCartStore.ts", "client/src/components/ProductGrid.tsx", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/context/CartContext.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Typing in the search box re-renders neither CartBadge nor any ProductRow.",
    "Adding a product re-renders CartBadge (the count and total change) but not the product rows.",
    "useCartActions() returns the same add/remove functions for the whole lifetime of the provider.",
    "Using the hooks outside a CartProvider throws a clear error.",
  ],
  reproSteps: [
    "Press Run. The panel on the right shows how many times each component has rendered.",
    "Type a few letters in the search box: the badge and every row counters climb with each keystroke.",
    "Click \"Add\" on one product: the badge updates (fine) but all the row counters increase too.",
  ],
  acceptanceCriteria: [
    "Search keystrokes cause 0 extra renders of CartBadge and ProductRow.",
    "An add causes exactly one extra render of CartBadge and 0 of the rows.",
    "add and remove keep their identity across state changes and provider re-renders.",
    "Behaviour is unchanged: quantities merge, totals are right, remove works.",
    "useCartState/useCartActions outside the provider throw \"useCartActions must be used inside <CartProvider>\" (or the State equivalent).",
  ],
  edgeCases: [
    "Adding the same product twice increments its quantity instead of duplicating the line",
    "Removing a product that is not in the cart",
    "The provider re-rendering because its parent re-rendered",
  ],
  hints: [
    "A context consumer re-renders whenever the value object it reads is a different object than last time. How often is `value` created?",
    "State that changes (items, total) and functions that do not (add, remove) have different update rhythms. They do not have to share one context.",
    "useMemo keeps the value stable between renders; functional setState (prev => …) lets add and remove avoid depending on the current items, so useCallback can keep them stable.",
  ],
  explanation: {
    rootCause:
      "The provider built a new `value` object (with new add/remove closures) on every render and put state and actions in a single context. Any re-render of the provider, for example because the shell's search box changed, gave every consumer a new value, so memo() on the consumers could not help. Actions consumers also re-rendered whenever the items changed.",
    fix: "Create two contexts: one for state ({ items, total, count }) memoised on items, and one for actions ({ add, remove }) built once with useCallback/functional updates and memoised. useCartState reads the first, useCartActions the second, and both throw when used outside the provider.",
    takeaways: [
      "Context re-renders every consumer when the value identity changes, regardless of memo().",
      "Split contexts by update frequency (state vs stable actions).",
      "Functional setState lets callbacks stay stable without depending on state.",
    ],
  },
  expectedFailures: ["search", "rows", "stable", "outside"],
});
