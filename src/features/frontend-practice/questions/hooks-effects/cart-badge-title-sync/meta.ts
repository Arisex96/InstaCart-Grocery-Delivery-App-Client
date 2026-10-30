import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-badge-title-sync",
  title: "Browser tab title shows a stale cart total",
  topic: "hooks-effects",
  difficulty: "easy",
  minutes: 15,
  summary: "An effect with an empty dependency array sets document.title once and never updates it.",
  scenario:
    "Shoppers who keep InstaCart open in a background tab rely on the tab title (\"(3) Cart · $12.50 | Instacart\") to see how much is in their cart. Support reports that the little badge on the cart button is always right, but the tab title keeps showing the cart as it was when the page loaded: add three items and the tab still says \"Instacart\".\n\n" +
    "CartButton is a trimmed version of the cart button in the Navbar. Fix the title sync, and make sure the component leaves the tab title the way it found it when it goes away (for example when the shopper navigates to a page that has no cart button).",
  inspiredBy: ["client/src/components/Navbar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/CartButton.jsx"],
  shared: ["src/data/products.js", "src/store/useCartStore.js", "src/components/ProductCard.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Empty cart: the tab title is \"Instacart\".",
    "Non-empty cart: the title is \"(<items>) Cart · $<total> | Instacart\" and follows every change (add, change quantity, remove, clear).",
    "When CartButton unmounts, document.title goes back to what it was before CartButton first changed it.",
    "The badge on the button keeps showing the item count.",
  ],
  reproSteps: [
    "Press Run and look at \"Tab title\" under the cart button: it reads \"Instacart\".",
    "Click the + button on two different product cards. The badge changes to 2, but the tab title does not.",
    "Click \"Clear cart\": the title should be plain \"Instacart\" again.",
  ],
  acceptanceCriteria: [
    "The title is recomputed whenever the item count or the total price changes.",
    "Changing only the quantity of an existing item (same item count of distinct products) still updates the title.",
    "The title is restored to its previous value when CartButton unmounts.",
    "No other behaviour of the cart button changes.",
  ],
  edgeCases: [
    "The cart already has items when the button first mounts",
    "Only the quantity (not the number of distinct products) changes",
    "The cart is emptied",
    "Unmounting must not leave an old cart total in the title",
  ],
  hints: [
    "Look at the dependency array of the effect that writes document.title. When does React re-run an effect?",
    "The effect reads two values from the store. Every value an effect reads should be in its dependency list.",
    "To restore the old title you need to remember it before the first change, and an effect can return a cleanup function. Mind the order in which effects in one component run.",
  ],
  explanation: {
    rootCause:
      "The effect that writes document.title has an empty dependency array, so React runs it only after the first render. It closes over the total_items and total_price of that first render and is never re-run when the store changes, so the title goes stale while the badge (which reads the store directly during render) stays correct.",
    fix: "List total_items and total_price in the dependency array so the effect re-runs on every relevant change. Capture the previous title in a separate mount-only effect that is declared before the title effect, and restore it in its cleanup so unmounting leaves the page title as it was.",
    takeaways: [
      "Treat the dependency array as the list of values the effect reads, not as a way to control when it runs.",
      "Side effects that change something global (document.title) should undo themselves in cleanup.",
      "Effects in a component run in declaration order, so capture the old value before writing the new one.",
    ],
  },
  expectedFailures: ["updates the tab title", "only the quantity", "emptied", "restores the previous title"],
});
