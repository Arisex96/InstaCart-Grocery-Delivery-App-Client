import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-list-mutation",
  title: "Mini cart buttons do nothing until something else re-renders",
  topic: "state-updates",
  difficulty: "easy",
  minutes: 15,
  summary: "MiniCart mutates its state array in place, so React never re-renders after + / - / remove.",
  scenario:
    "The \"Reorder\" drawer shows the items of a previous order in a MiniCart so the shopper can tweak quantities before adding everything to the cart. Support reports that the + and - buttons do nothing at first; the numbers only jump to the right value later, when something unrelated makes the drawer re-render (for example opening the filters). Removing an item behaves the same way.\n\n" +
    "Another symptom was found by the data team: after using the drawer, the previous order in the order history shows the edited quantities, because the drawer edits the objects it was handed.\n\n" +
    "MiniCart keeps its items in local state, like the cart sidebar does for display. Fix its update logic.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/MiniCart.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "+ and - change the displayed quantity immediately; - at quantity 1 removes the item.",
    "The remove button removes the item immediately; the total always matches the visible items.",
    "The array and item objects passed in as initialItems are never modified.",
    "Quantity cannot exceed the product's stock.",
  ],
  reproSteps: [
    "Press Run. In the preview, click + on \"Organic Bananas\": the quantity does not change.",
    "Click \"Re-render drawer\": the quantity suddenly shows the new value (the data was mutated, React just did not know).",
    "Look at the \"Previous order\" box under the drawer: it shows the edited quantities too.",
  ],
  acceptanceCriteria: [
    "Every button updates the UI on the same click.",
    "initialItems (array and objects) are untouched; the previous order stays as it was.",
    "Total is correct after every action.",
    "Stock limit respected when increasing.",
  ],
  edgeCases: [
    "- on a quantity of 1",
    "+ when quantity already equals stock",
    "removing the last item shows the empty state",
  ],
  hints: [
    "React decides whether to re-render by comparing the old and new state value. What does setItems(items) compare?",
    "Never modify items in place (no `item.quantity += 1`, no splice). Build a new array with map / filter and put new objects in it.",
    "For a single changed item use { ...item, quantity: newQuantity } so the other items keep their identity.",
  ],
  explanation: {
    rootCause:
      "The handlers changed `item.quantity` and spliced the array in place, then called setItems with the very same array reference. React bails out of the render when the new state is Object.is-equal to the old state, so nothing re-rendered; the stale UI only updated when another state change caused a render. Because the objects were shared with the caller, the original order data was edited too.",
    fix: "Treat state as immutable: use setItems(prev => prev.map(...)) / prev.filter(...) and copy changed items with the spread operator. The new array reference makes React re-render and the input data stays untouched.",
    takeaways: [
      "Mutating state and passing the same reference to its setter is a no-op for React.",
      "map/filter/spread produce new values; splice/push/`+=` on state do not.",
      "Objects passed through props or initial state are shared; mutating them leaks changes to other owners.",
    ],
  },
  expectedFailures: ["immediately", "not modify"],
});
