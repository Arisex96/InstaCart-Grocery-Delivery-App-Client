import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-card-stock-states",
  title: "Product card prints a stray 0 and sells out-of-stock items",
  topic: "components",
  difficulty: "easy",
  minutes: 15,
  summary: "ProductCard renders `0` for undiscounted products and has no out-of-stock state.",
  scenario:
    "Merchandising reported two problems on the Products page. First, every product without a discount shows a lonely \"0\" in the top-left corner of its card. Second, the avocados have been sold out for a week but still look purchasable: the + button works, nothing tells the shopper the item is gone, and the milk that is down to its last few units gives no hint either.\n\n" +
    "This is a trimmed copy of src/components/ProductCard.tsx. Fix the badge logic and add the stock states without changing the card's layout or the way it adds to the cart.",
  inspiredBy: ["client/src/components/ProductCard.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/ProductCard.jsx"],
  shared: ["src/data/products.js", "src/store/useCartStore.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "A product with discount 0 shows no badge and no stray text; a discounted product shows \"<n>% OFF\" and its struck-through original price.",
    "stock === 0: the card says \"Out of stock\" and the add button is disabled (aria-label \"Out of stock\"). Clicking it never touches the cart.",
    "stock between 1 and 5: the card says \"Only <n> left\". Higher stock shows nothing extra.",
    "An in-stock product still adds exactly one unit per click.",
  ],
  reproSteps: [
    "Press Run to open the live preview and look at the \"Organic Bananas\" card: a \"0\" is printed in the corner.",
    "Look at the \"Hass Avocados\" card (stock 0): it looks buyable, and the + button is still enabled.",
    "Click + on \"Whole Milk\" and \"Dark Chocolate Bar\": no low-stock warning is shown (their stock is 3 and 5).",
  ],
  acceptanceCriteria: [
    "No \"0\" (or other stray text) is rendered for a product with discount 0.",
    "Out-of-stock products render \"Out of stock\" and a disabled add button.",
    "Low-stock products (1–5) render \"Only N left\".",
    "Adding an in-stock product still calls the cart store once with quantity 1.",
  ],
  edgeCases: [
    "stock is exactly 0, 1, 5 and 6",
    "discount is 0 (falsy but meaningful)",
    "originalPrice equals price even though discount > 0",
  ],
  hints: [
    "In JSX, `{value && <X />}` renders `value` itself whenever it is falsy. Which falsy values can still be printed?",
    "Compute booleans like `isOutOfStock` and `isLowStock` once at the top of the component, then reuse them in the badge, the label and the button.",
    "A disabled button should also tell assistive tech why: give it a different aria-label, and guard the click handler as well.",
  ],
  explanation: {
    rootCause:
      "`{discount && <span>…</span>}` short-circuits to `discount` itself when it is 0, and React renders the number 0 (unlike false, null or undefined). Separately, the card never looked at `stock`, so every product was rendered as purchasable.",
    fix: "Use an explicit comparison (`discount > 0 &&`) so the expression is a real boolean, derive `isOutOfStock`/`isLowStock` from `stock`, render the matching label, and disable (and guard) the add button when the product is out of stock.",
    takeaways: [
      "Never put a number on the left of && in JSX; compare it explicitly or convert with Boolean().",
      "Derive state-like flags once, near the top, and reuse them.",
      "Disabled controls need both the attribute and a guard in the handler, plus an accessible name.",
    ],
  },
  expectedFailures: ["stray 0", "out of stock", "low stock"],
});
