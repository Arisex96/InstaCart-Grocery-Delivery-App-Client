import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-item-notes-keys",
  title: "Cart notes jump to the wrong product when an item is removed",
  topic: "lists",
  difficulty: "easy",
  minutes: 15,
  summary: "Rows keyed by array index keep their local state when the list changes shape.",
  scenario:
    "Shoppers can leave a per-item note in the cart (\"ripe, please\", \"no plastic bag\"). Customer support received complaints that after removing an item, the note they had written for it moved to the item below. The same happens when the cart is re-sorted.\n\n" +
    "CartItemList is a trimmed version of the item rows in src/components/CartSideBar.tsx, extended with a per-row note field that lives in the row's own state.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/CartItemList.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "A note always stays with the product it was written for.",
    "Removing any row, or reordering the cart, never moves a note to a different product.",
    "No React key warnings are logged.",
  ],
  reproSteps: [
    "Press Run and type \"ripe please\" into the note of the first product (Organic Bananas).",
    "Click the trash icon on Organic Bananas: the note now appears under Whole Milk.",
    "Press \"Reverse order\" with notes in several rows and watch the notes stay in place while the products swap.",
  ],
  acceptanceCriteria: [
    "Rows are keyed by a stable product identity.",
    "Notes follow their product after removals and reordering.",
    "onRemove is called with the product's _id.",
  ],
  edgeCases: ["Removing the first row", "Removing the last row", "Reversing the list"],
  hints: [
    "React decides whether to keep or recreate a component's state by comparing keys between renders. What does the current key identify: the product or the position?",
    "After removing the first item, every remaining item moves up one position. What happens to the key of each?",
    "Use a value that belongs to the data and never changes for that item.",
  ],
  explanation: {
    rootCause:
      "`key={index}` identifies a row by its position. When the first row is removed, the row that used to be at index 1 now has key 0, so React reuses the first row's component instance (and its note state) for a different product.",
    fix: "Key each row by the product's `_id`, which is stable and unique within the cart. React then matches component instances to products instead of positions, and keeps or drops state correctly.",
    takeaways: [
      "Keys are identity, not position: use ids from the data.",
      "Index keys are only safe for static lists that are never reordered, inserted into or removed from.",
      "Local state in list rows is where wrong keys become visible.",
    ],
  },
  expectedFailures: ["earlier row is removed", "reordered"],
});
