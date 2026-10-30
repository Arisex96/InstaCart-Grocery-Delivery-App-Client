import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-quantity-stepper",
  title: "Cart stepper lets shoppers exceed stock and deletes items by accident",
  topic: "components",
  difficulty: "medium",
  minutes: 25,
  summary: "A reusable QuantityStepper ignores its max, drops its min, and swallows extra props.",
  scenario:
    "The cart sidebar's +/- buttons were extracted into a reusable QuantityStepper so the product page and the checkout summary can share them. Since the extraction, QA found that a shopper can push the quantity one above the available stock (the store then silently clamps it back), and that pressing - on a quantity of 1 removes the whole line instead of stopping at 1.\n\n" +
    "Teams also complain that the component is not reusable: passing a data-testid, an aria-label or a className to it does nothing, and a `disabled` prop (used while an order is being placed) is ignored.\n\n" +
    "Fix QuantityStepper. CartItemCard (read-only) is the real consumer, modelled on Item_card in src/components/CartSideBar.tsx.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/QuantityStepper.jsx"],
  shared: ["src/store/useCartStore.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The minus button is disabled when value <= min (default min 1); the plus button is disabled when value >= max.",
    "Clicking plus/minus calls onChange(value + 1) / onChange(value - 1) exactly once, and never with a value outside [min, max].",
    "`disabled` disables both buttons.",
    "Extra props (data-testid, aria-label, id…) are forwarded to the root element and className is merged with the base classes.",
  ],
  reproSteps: [
    "Press Run. In the preview, find the \"Whole Milk\" row (stock 3) and click + until the quantity is 3.",
    "The + button is still enabled; clicking it asks for 4. Open the Console tab: nothing warns you.",
    "Click - on the \"Organic Bananas\" row while its quantity is 1: the whole row disappears.",
  ],
  acceptanceCriteria: [
    "At value === max the increase button is disabled and onChange is never called with max + 1.",
    "At value === min the decrease button is disabled and onChange is never called with min - 1.",
    "`disabled` disables both buttons; extra props reach the root element; className is merged.",
    "CartItemCard keeps working: quantity changes still go through update_quantity.",
  ],
  edgeCases: [
    "value above max (stock dropped after the item was added)",
    "max omitted (no limit)",
    "custom min of 0",
    "className passed by the caller must not replace the base styling",
  ],
  hints: [
    "Compare what the disabled attribute checks with what the handler is about to ask for. Is the boundary value itself allowed?",
    "Compute `atMin` and `atMax` once, then reuse them for both the disabled attributes and the click guards.",
    "Pull the props you own out with destructuring and spread the remainder (...rest) onto the root element; build the class string from the base classes plus className.",
  ],
  explanation: {
    rootCause:
      "The boundary checks are off by one: `value < min` and `value > max` only disable the buttons after the limit has already been crossed. The component also destructured only the props it knew about, so `disabled`, `className` and any other attribute never reached the DOM.",
    fix: "Disable on `value <= min` and `value >= max` (and when `disabled` is set), guard the handlers with the same flags, and spread the remaining props onto the root element while merging className.",
    takeaways: [
      "A limit is reached when value equals it, not when it is exceeded.",
      "Reusable components forward unknown props and merge className instead of replacing it.",
      "Derive the boundary booleans once and use them for UI and logic alike.",
    ],
  },
  expectedFailures: ["beyond max", "at the minimum", "forwards"],
});
