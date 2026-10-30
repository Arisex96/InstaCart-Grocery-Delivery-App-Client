import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "ai-wishlist-review",
  title: "Review the AI-generated wishlist before it ships",
  topic: "testing-ai",
  difficulty: "hard",
  minutes: 40,
  summary: "An AI assistant wrote a wishlist hook and panel. It looks plausible; review it, find the flaws and fix them.",
  scenario:
    "A teammate gave an AI assistant this prompt:\n\n" +
    "\"Create a useWishlist hook for our grocery app. Shoppers tap a heart on a product to add or remove it. Update the UI immediately, then sync with api.put('/wishlist/:productId'). If the sync fails, undo that change and expose an error message. Also build a WishlistPanel that lists the wished products sorted by name with a remove button for each, and a friendly message when the list is empty.\"\n\n" +
    "The generated code compiles and the first tap seems to work, so it was about to be merged. Review it like a pull request: read every line, run it, and fix what is wrong. WishlistButton and the demo are correct and read-only; the problems are in useWishlist.js and WishlistPanel.jsx.",
  inspiredBy: ["client/src/components/ProductCard.tsx", "client/src/store/useCartStore.ts", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/hooks/useWishlist.js", "src/components/WishlistPanel.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Tapping hearts wishes products one after another; tapping a wished product un-wishes it.",
    "A failed sync undoes only that product's change, keeps the others, and exposes an error message.",
    "The panel lists wished products sorted by name with a remove button each, and says \"Your wishlist is empty\" when there are none.",
  ],
  reproSteps: [
    "Press Run. In the preview tap the heart on \"Organic Bananas\", then on \"Whole Milk\": the first one disappears from the wishlist.",
    "Tap a wished product again: it is added a second time instead of removed.",
    "Tap the heart on \"Hass Avocados\": the server rejects it (see the Console), but the avocados stay in the wishlist and no error is shown.",
    "Look at the panel: it crashes as soon as one product is wished (read the error), and when nothing is wished it shows nothing at all.",
  ],
  acceptanceCriteria: [
    "Review checklist — stale closures: callbacks created with useCallback/useMemo list every value they read, or avoid reading state directly.",
    "Review checklist — failures: every await that can reject is handled; optimistic changes are rolled back (only the failed one) and an error is exposed.",
    "Review checklist — APIs exist: every imported icon and every array method really exists in the libraries/runtime used here.",
    "Review checklist — states: empty, error and non-empty are all rendered; props are not mutated.",
  ],
  edgeCases: [
    "Two products toggled in quick succession",
    "The same product toggled on and off",
    "One of two pending syncs fails",
    "The panel receives an empty array / an array it must not reorder",
  ],
  hints: [
    "Run the preview and read the Console before reading the code. Each symptom in the reproduction steps points to a different line.",
    "A callback memoised with an empty dependency array only ever sees the state of the first render. What does `ids` look like inside `toggle` on the second tap?",
    "Look at what the panel imports and calls. Check each name against what really exists: lucide-react exports `Heart`, `Trash2`, `X`…; arrays have `sort` and `toSorted`, not `sortBy`.",
    "For rollbacks, undo only the product that failed (add it back or remove it), using the latest ids, not a snapshot taken before other taps.",
  ],
  explanation: {
    rootCause:
      "The generated code has five flaws that look harmless in a quick read: (1) toggle is memoised with [] so it always sees the initial empty list (stale closure); (2) a failed sync is only logged: nothing is rolled back and no error is exposed; (3) the panel calls Array.prototype.sortBy, which does not exist (borrowed from lodash/Ruby); (4) it imports HeartOff, an icon that lucide-react does not export, so rendering it crashes; (5) the panel returns null for an empty list instead of an empty state.",
    fix: "Keep the latest ids in a ref (or use functional updates) so toggle can stay stable without being stale; wrap the api call in try/catch and undo only the failed product, exposing an error message; sort a copy with [...products].sort(localeCompare); use an icon that exists (Trash2); render an explicit empty state.",
    takeaways: [
      "AI-generated code often invents plausible APIs: verify every import and method against the real library.",
      "Review dependency arrays and async error paths first; they are where generated code is weakest.",
      "Roll back optimistic updates per item, not by restoring a whole old snapshot.",
      "Turn each review finding into a test.",
    ],
  },
  expectedFailures: ["keeps earlier items", "off again", "rolls back", "empty message", "sorted by name"],
});
