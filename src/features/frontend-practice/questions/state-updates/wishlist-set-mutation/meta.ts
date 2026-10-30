import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "wishlist-set-mutation",
  title: "Wishlist count is wrong and the saved list never updates",
  topic: "state-updates",
  difficulty: "hard",
  minutes: 35,
  summary: "useWishlist mutates a Set in place and keeps count/total as separate state, so memoised views and batched updates go stale.",
  scenario:
    "The new wishlist (heart button on every product card) is backed by a useWishlist hook. Reports from beta users: the \"Saved items\" list under the hearts stays empty even though hearts are filled; \"Save all bakery items\" saves two products but the counter says 1 and the total is wrong; after a price change from the API the wishlist total still shows the old prices; and tapping a heart on a product that was just removed from the catalogue throws.\n\n" +
    "The hook keeps ids in a Set. Everything the UI shows (the saved products, how many, the total price) must always be consistent with that Set and with the current products prop. Public API: { ids, items, count, totalPrice, has(id), toggle(id), clear() }.",
  inspiredBy: ["client/src/store/useCartStore.ts", "client/src/components/ProductCard.tsx", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/hooks/useWishlist.js"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "toggle(id) adds the product to the wishlist or removes it; has(id) reflects it immediately.",
    "ids is a new Set instance after every change (the previous Set is never modified).",
    "items, count and totalPrice (rounded to cents) are always derived from ids and the current products, so several toggles in one event and price updates are reflected.",
    "toggle for an id that is not in products is ignored; clear() empties the wishlist.",
  ],
  reproSteps: [
    "Press Run and click two hearts: the counter updates, but \"Saved items\" stays empty.",
    "Click \"Save all bakery items\" (two products): the counter shows 1 and the total is only one product's price.",
    "Click \"Reprice the catalogue (+10%)\" while items are saved: the total does not change.",
  ],
  acceptanceCriteria: [
    "The previous Set is never mutated: ids changes identity on every toggle.",
    "Toggling several products in a single event ends with the right count and total.",
    "items lists exactly the saved products; totalPrice follows the current prices.",
    "No duplicated derived state: count and total cannot drift from the ids.",
  ],
  edgeCases: [
    "toggle the same id twice (add then remove)",
    "toggle an unknown id",
    "products prop changes (prices) while items are saved",
    "total with prices that are not exactly representable (1.2 + 3.5 + 2.25)",
  ],
  hints: [
    "React state updates are detected by reference. What does `ids.add(x)` do to the reference stored in state?",
    "Two toggles in the same click handler both read the same `count` from the closure. What form of setState avoids stale reads?",
    "count and totalPrice can be computed from ids and products on every render (useMemo). Why is it risky to also keep them in useState?",
  ],
  explanation: {
    rootCause:
      "ids was a Set created once and mutated with add/delete: its identity never changed, so every useMemo that depended on it (the saved items list) kept its first result. count and total were separate useState values updated from closure variables (`setCount(count + 1)`), so toggles batched in one event overwrote each other, and the total was never recomputed when product prices changed. An unknown id crashed on `product.price`.",
    fix: "Keep a single source of truth: an immutable Set updated with the functional form (`setIds(prev => { const next = new Set(prev); … return next; })`). Derive items, count and totalPrice with useMemo from ids and products, round the total to cents, and ignore ids that are not in products.",
    takeaways: [
      "Mutating a Set/Map/array in state defeats every dependency array and memo that reads it.",
      "Use functional updates when the next state depends on the previous one, especially inside batches.",
      "Do not store values you can derive; derive them during render (useMemo if expensive).",
    ],
  },
  expectedFailures: ["new Set", "several products", "current prices", "items"],
});
