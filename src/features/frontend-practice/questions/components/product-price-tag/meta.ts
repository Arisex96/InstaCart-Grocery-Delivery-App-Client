import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-price-tag",
  title: "Build the product price tag",
  topic: "components",
  difficulty: "easy",
  kind: "build",
  minutes: 25,
  summary: "Render price, strike-through original, discount badge, per-unit price and screen reader text.",
  scenario:
    "Product cards and the product page each formatted prices by hand and drifted apart: one showed 1.2 instead of $1.20, another forgot the struck-through price, and screen readers read the price, the old price and the badge as three unrelated numbers.\n\n" +
    "Build one reusable PriceTag in src/components/PriceTag.jsx that takes a product and renders every price state. The Demo lets you switch between sample products, and the Target UI tab shows the finished tag.",
  inspiredBy: ["client/src/components/ProductCard.tsx", "client/src/pages/ProductPage.tsx"],
  editableFiles: ["src/components/PriceTag.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "The current price is always shown as dollars with two decimals (\"$1.20\"), in bold app-green. A price of exactly 0 shows the word \"Free\" instead of \"$0.00\".",
    "On sale (discount > 0 AND originalPrice > price): the current price turns red, the original price follows in a <del> element (\"$4.40\", small and grey), and a pill badge reads \"<discount>% OFF\" (rounded to a whole number). If originalPrice is not higher than price, ignore the discount completely.",
    "Below the price, one muted line shows the price per unit as \"$<price per unit> / <label>\". The `unit` string is \"<count> <label>\" (e.g. \"2 lb\" at $4.80 gives \"$2.40 / lb\"); a unit with no leading number (\"each\") counts as 1 and gives \"$2.00 / each\". No per-unit line for Free items or an empty unit.",
    "Accessibility: render one visually hidden element (class sr-only) with the full sentence and mark the visible price, <del> and badge aria-hidden=\"true\" so they are not read twice. Sentences: \"Now $3.50, was $4.40, 20% off\" on sale, \"Price $1.20\" otherwise, \"Free\" for free items.",
  ],
  expectedBehavior: [
    "Every amount is formatted as dollars with two decimals and never shows floating point noise.",
    "Switching product in the Demo changes every part of the tag.",
    "Bad data (a \"discount\" with originalPrice <= price) renders like a normal price.",
  ],
  reproSteps: [
    "Press Run: the skeleton prints the raw number only.",
    "Open the Target UI tab to see the finished tag for each sample product.",
    "Use the Demo buttons (Regular, On sale, Multi-pack, Free sample, Bad data) while you build.",
  ],
  acceptanceCriteria: [
    "Price formatted \"$X.XX\", or \"Free\" when 0.",
    "Sale state shows the <del> original price and an \"N% OFF\" badge; non-sale and bad-data states show neither.",
    "Per-unit line is computed from the unit string and the price.",
    "One sr-only sentence carries the meaning; the visual parts are aria-hidden.",
  ],
  edgeCases: ["price 0", "discount > 0 but originalPrice <= price", "unit without a number (\"each\")", "price like 1.2 (floating point)", "empty or missing unit"],
  hints: [
    "Write two tiny helpers first: money(n) for \"$1.20\" and perUnit(price, unit). Everything else is composition.",
    "A regular expression like /^(\\d+(?:\\.\\d+)?)\\s+(.+)$/ splits \"12 pk\" into a count and a label; fall back to count 1.",
    "Compute `onSale` once, then use it for the colour, the <del>, the badge and the sr-only sentence so they can never disagree.",
  ],
  explanation: {
    rootCause: "This is a build exercise, so nothing is broken. The traps are formatting money in several places, forgetting the bad-data case, and giving assistive tech three loose numbers instead of one sentence.",
    fix: "Centralise formatting in small helpers, derive `onSale`, `free` and the per-unit text once from the product, render the visual parts aria-hidden and add a single sr-only sentence that is built from the same values.",
    takeaways: [
      "One derived boolean (`onSale`) keeps the visuals and the screen reader text consistent.",
      "Guard against inconsistent data instead of trusting a discount field.",
      "A visually hidden sentence beats several fragments for assistive tech.",
    ],
  },
  expectedFailures: ["two decimals", "strikes through", "per unit", "Free", "screen readers"],
});
