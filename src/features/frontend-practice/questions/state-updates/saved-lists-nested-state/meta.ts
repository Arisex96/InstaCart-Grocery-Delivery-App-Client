import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "saved-lists-nested-state",
  title: "Saved lists show stale quantities and wrong totals",
  topic: "state-updates",
  difficulty: "hard",
  minutes: 40,
  summary: "A nested-state hook mutates items in place and keeps a separate, drifting totals state.",
  scenario:
    "\"Saved lists\" lets shoppers keep several named shopping lists (Weekly shop, Party…) with products and quantities. The state is nested: lists → items → { product, quantity }. The list cards are wrapped in a memoised component that only re-renders when its `list` object changes, which is a normal optimisation for long lists.\n\n" +
    "Bug reports: changing a quantity often does not show up until you touch another list; the list total sometimes disagrees with the items (always after moving an item to another list); and the analytics team found that the saved lists they loaded from the server were modified in place while users clicked around (their cache holds frozen objects in development and throws).\n\n" +
    "Fix useSavedLists. SavedLists (read-only) is the memoised view that consumes it.",
  inspiredBy: ["client/src/store/useCartStore.ts", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/hooks/useSavedLists.js"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "setQuantity(listId, productId, qty) changes that item only; qty <= 0 removes it; qty is clamped to the product's stock.",
    "removeItem, moveItem (merging quantities into an existing item of the target list, clamped to stock) and renameList (trimmed, empty names ignored) behave accordingly.",
    "State is updated immutably: the input data is never modified, changed lists/items get new references and untouched ones keep theirs.",
    "listTotal(listId) is derived from the current items, so it can never disagree with them.",
  ],
  reproSteps: [
    "Press Run. In the preview, click + on \"Organic Bananas\" in the Weekly shop list: the quantity stays at 1 (the card is memoised and the item object was mutated).",
    "Click \"Move to Party\" on Whole Milk: the Party list total does not change although the item arrived.",
    "Open the Console: the demo freezes its data, so the mutation also logs an error from the failing assignment.",
  ],
  acceptanceCriteria: [
    "A quantity change is visible immediately in the memoised list card.",
    "No input object is mutated (works with deep-frozen data).",
    "Totals always equal the sum of price × quantity of the visible items, including after moves, merges and removals.",
    "Only the changed path gets new references (structural sharing).",
  ],
  edgeCases: [
    "moving an item whose product already exists in the target list (merge, clamp to stock)",
    "moving to the same list (no-op)",
    "setQuantity on an unknown list or product",
    "removing the last item of a list keeps the (empty) list",
  ],
  hints: [
    "A memoised child only re-renders when a prop changes identity. Check which objects on the path lists → list → items → item keep the same identity after your update.",
    "Update with the functional form and copy every level on the path to the change: lists.map(l => l.id === id ? { ...l, items: l.items.map(...) } : l). Siblings that did not change are returned as they are.",
    "A second `totals` state is a copy that has to be kept in sync by hand. Can you compute the total from `lists` instead of storing it?",
  ],
  explanation: {
    rootCause:
      "The hook shallow-copied only the outer array (`[...lists]`) and then assigned to `item.quantity` / `list.items` on the shared nested objects. The list and item references never changed, so the memoised card saw no new props and kept showing the old numbers, and frozen input data threw. The totals were stored in a second state object that each action had to update by hand; moveItem forgot the target list, so the copy drifted from the truth.",
    fix: "Make every update immutable along the changed path (map to copy lists, spread the changed list and item, filter to remove) so untouched branches keep their identity, and compute totals from `lists` (derived state) instead of storing them.",
    takeaways: [
      "Nested state needs a new object at every level of the path you change.",
      "Structural sharing (reusing unchanged branches) is what makes React.memo and selectors effective.",
      "Derived values should be computed from the source of truth, not stored next to it.",
    ],
  },
  expectedFailures: ["frozen", "new references", "total"],
});
