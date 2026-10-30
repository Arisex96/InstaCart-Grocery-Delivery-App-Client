import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "wishlist-toggle-button",
  title: "Build the wishlist heart button and counter",
  topic: "state-updates",
  difficulty: "easy",
  kind: "build",
  minutes: 20,
  summary: "A controlled heart toggle with correct ARIA state, plus a saved-items counter badge.",
  scenario:
    "Product managers want shoppers to save products for later. Design added a heart button to every product card and a small counter in the header that shows how many products are saved.\n\n" +
    "Build WishlistButton (a controlled toggle) and WishlistCount (the header badge). The saved ids live in the parent: the Demo keeps them in one piece of state shared by every card and the header. Open the Target UI tab to see the finished version.",
  inspiredBy: ["client/src/components/ProductCard.tsx"],
  editableFiles: ["src/components/WishlistButton.jsx", "src/components/WishlistCount.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "WishlistButton is a real <button type=\"button\"> that shows a heart icon (HeartIcon from lucide-react). Saved: red and filled (fill-red-500 text-red-500). Not saved: outline in muted text (text-app-text-light).",
    "Accessibility contract: aria-pressed is \"true\" when saved and \"false\" otherwise, and the accessible name is \"Add <product name> to wishlist\" when not saved and \"Remove <product name> from wishlist\" when saved.",
    "Clicking calls onToggle(product._id) exactly once and does not bubble to the parent (the product card is clickable). WishlistButton holds no saved-state of its own: it renders what isSaved says.",
    "WishlistCount takes savedIds and renders a rounded pill with a heart icon and a numeric badge. The pill has role=\"status\" and aria-label \"Wishlist: N items\" (\"Wishlist: 1 item\" for one, \"Wishlist: empty\" for none).",
    "The count is the number of DISTINCT ids. With none saved, the numeric badge is not rendered. Above 9 the badge reads \"9+\".",
  ],
  expectedBehavior: [
    "Toggling a heart on one card updates that card and the counter immediately, and no other card.",
    "The counter never double counts an id that appears twice in savedIds.",
  ],
  reproSteps: [
    "Press Run and click a few hearts in the Demo: with the stub nothing happens.",
    "Open the Target UI tab and click hearts there to see the finished behaviour and counter.",
    "Save more than nine products in the Target UI (use the \"Save all\" button) to see the \"9+\" badge.",
  ],
  acceptanceCriteria: [
    "The button exposes aria-pressed and the Add/Remove accessible names.",
    "onToggle is called once per click with the product id, and the click does not bubble.",
    "The counter shows distinct ids, \"9+\" above nine, singular/plural/empty labels, and no badge when empty.",
  ],
  edgeCases: ["savedIds contains duplicates", "exactly 9 and 10 saved products", "savedIds is empty", "a parent onClick wraps the button"],
  hints: [
    "The button should be a pure function of its props: no useState inside WishlistButton.",
    "aria-pressed needs a real boolean (or the strings \"true\"/\"false\"); build the label from isSaved at render time.",
    "new Set(savedIds).size gives you the distinct count; compute it during render instead of storing it.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise. The main trap is keeping the saved flag as local state inside each button: the header counter and the button then drift apart. Lift the state up and make the button controlled.",
    fix: "Keep one saved-ids array in the parent. WishlistButton renders isSaved and reports clicks with onToggle(id); WishlistCount derives its number from savedIds during render (new Set(savedIds).size) and formats the label and badge from it.",
    takeaways: [
      "Lift shared state to the closest common parent and pass it down as props.",
      "Derive counts during render instead of storing them.",
      "A toggle button needs aria-pressed and an accessible name that reflects its current action.",
    ],
  },
  expectedFailures: ["aria-pressed", "accessible name", "count"],
});
