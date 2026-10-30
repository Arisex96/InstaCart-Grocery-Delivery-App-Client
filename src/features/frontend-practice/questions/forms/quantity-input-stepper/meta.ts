import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "quantity-input-stepper",
  title: "Build the quantity input with stock limits",
  topic: "forms",
  difficulty: "easy",
  kind: "build",
  minutes: 25,
  summary: "A controlled quantity field with +/- buttons, clamping on blur and a stock message.",
  scenario:
    "The cart sidebar only has + and - buttons. Shoppers buying 24 cans of sparkling water want to type the number, and the team keeps hitting the same bugs when they hand-roll it: NaN in the cart, quantities above the stock, and an empty box that wipes the line.\n\n" +
    "Build a reusable controlled QuantityInput in src/components/QuantityInput.jsx. The parent owns the value; your component reports changes through onChange. The Demo wires it to products with different stock levels and the Target UI tab shows the finished control.",
  inspiredBy: ["client/src/components/CartSideBar.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/QuantityInput.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A pill-shaped control: a minus button, a centred text input, a plus button. The wrapper has role=\"group\" and aria-label=\"Quantity selector\"; the input has aria-label=\"Quantity\" and inputMode=\"numeric\".",
    "The buttons have aria-labels \"Decrease quantity\" and \"Increase quantity\". Minus is disabled when value <= min, plus is disabled when value >= max.",
    "Under the control a status line (role=\"status\") reads \"Only <max> in stock\" while value equals a finite max; it is empty otherwise.",
    "Props: value (number, controlled), onChange(n), min (default 1), max (default Infinity). The input shows what the shopper types; it syncs to `value` whenever the parent changes it.",
    "Typing: onChange is called only with whole numbers inside [min, max] (e.g. \"12\"); partial or invalid text (\"\", \"abc\", \"99\" above max) never triggers onChange. On blur the field is clamped: too large becomes max, too small becomes min, empty or non-numeric reverts to the current value.",
  ],
  expectedBehavior: [
    "The parent never receives NaN, a decimal, or a number outside [min, max].",
    "The text box always shows a valid quantity after the shopper leaves it.",
    "The buttons and the stock message always match the current value.",
  ],
  reproSteps: [
    "Press Run: the skeleton shows a read-only box and dead buttons.",
    "Open the Target UI tab, then try typing 99 on the Whole Milk scenario (stock 3) and tabbing away.",
    "Switch scenarios in the Demo to check a large stock (bananas), a tiny stock (milk) and a single-item limit.",
  ],
  acceptanceCriteria: [
    "+ and - change the value by one and disable at the bounds.",
    "Typing calls onChange only for valid integers within the bounds.",
    "Blur clamps (above max, below min) or reverts (empty/invalid).",
    "\"Only N in stock\" appears exactly when value reaches a finite max.",
  ],
  edgeCases: ["empty box", "non-numeric text", "number above max / below min", "parent changes value while the box is not focused", "max = Infinity (no message)"],
  hints: [
    "The input needs its own draft string: a controlled number input cannot represent \"\" or \"1\" on the way to \"12\".",
    "Validate the draft with /^\\d+$/ before parsing, and only call onChange when the number is inside [min, max] and different from `value`.",
    "On blur compute the clamped number, set the draft to it explicitly (the parent value may not change), and call onChange only if it differs from `value`.",
  ],
  explanation: {
    rootCause: "This is a build exercise. The classic traps are binding a numeric input straight to the number (so typing is impossible), forwarding NaN to the parent, and forgetting that blur must resync the draft even when the parent value is unchanged.",
    fix: "Keep a draft string next to the controlled `value`, sync it from `value` in an effect, forward only valid in-range integers while typing, and clamp or revert on blur. Derive the disabled states and the stock message from `value`, `min` and `max`.",
    takeaways: [
      "Text inputs need a string draft; parse at the edges.",
      "Validate before notifying the parent so it only ever sees valid state.",
      "Re-sync local draft state on blur, not only when props change.",
    ],
  },
  expectedFailures: ["plus and minus", "disables", "announces", "typed integers", "clamps", "reverts"],
});
