import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "ai-coupon-review",
  title: "Review the AI-generated coupon engine before it ships",
  topic: "testing-ai",
  difficulty: "hard",
  minutes: 40,
  summary: "Plausible AI-written coupon code with several subtle flaws. Review it against the spec and fix it.",
  scenario:
    "A teammate asked an AI assistant:\n\n" +
    "\"Write applyCoupons(items, coupons, now) for our cart. Coupons are percent or fixed. Respect minSubtotal and expiry. A coupon may be stackable; only one non-stackable coupon can be used (the best one). Fixed discounts apply first, then percentages on what is left. Round to cents. The total can't go below zero. Don't mutate the arguments.\"\n\n" +
    "The assistant replied with src/lib/coupons.js, said every edge case was handled, and the Demo (the checkout summary from client/src/pages/Checkout.tsx, reduced) looks right with the default coupons. Your job is the review: compare the code with the spec, reproduce the problems, and fix them without rewriting the public API.",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/lib/coupons.js"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Fixed discounts are taken first, then each percentage coupon is taken from what is left.",
    "At most one non-stackable coupon is used (the one worth most); stackable coupons all apply.",
    "A coupon is valid up to and including its expiresAt instant and while subtotal >= minSubtotal.",
    "Every discount and the total are whole cents; the total is never negative and a discount is never larger than what is left.",
    "The arguments are never mutated. An empty cart gives { subtotal: 0, discounts: [], total: 0 }.",
  ],
  reproSteps: [
    "Press Run and tick every coupon in the preview: compare the discount lines with a hand calculation (fixed first, then percent).",
    "Untick every non-stackable coupon (BIG20 and FLAT8): the preview crashes, see the Runtime error and the Console.",
    "Tick only FLAT8 and then press Empty the cart, or use a small cart: look at the totals and the console output.",
  ],
  acceptanceCriteria: [
    "Review checklist: input mutation, ordering of fixed vs percent, expiry boundary, stacking rule, rounding to cents, total floor at 0, empty cart, minSubtotal.",
    "Review checklist: every function and method used actually exists in the runtime (no invented APIs).",
    "All eight spec tests pass and the Demo no longer crashes for any combination of coupons.",
    "The exported function name and the shape of its return value are unchanged.",
  ],
  edgeCases: [
    "No non-stackable coupon eligible",
    "now exactly equal to expiresAt",
    "A fixed coupon larger than the cart",
    "Coupons passed as a frozen or shared array",
    "A percentage that does not divide into cents (10% of 33.33)",
  ],
  hints: [
    "Read the prompt as a checklist and test each sentence of it separately. Which sentences does the generated code not actually implement?",
    "Check what every array method does to its input (sort, reverse and splice change the array) and what reduce does on an empty array without an initial value.",
    "Search the code for functions you have never used. Is there a Math.clamp in JavaScript? And think about what happens to 10% of 33.33 in floating point.",
    "Doing the arithmetic in integer cents and rounding once per discount removes a whole class of bugs.",
  ],
  explanation: {
    rootCause:
      "The generated code looks idiomatic but does not implement the spec: it sorts the caller's array in place (mutation) and applies discounts in value order instead of fixed-then-percent; it uses < for expiry; reduce() with no initial value throws when no non-stackable coupon is eligible; discounts are unrounded floats and a fixed coupon can exceed the cart; and it calls Math.clamp, which does not exist. The demo only exercised the happy path, which is why it looked correct.",
    fix: "Compute in integer cents, filter without sorting the input, include the expiry instant (<=), pick the best non-stackable coupon with reduce(..., null), apply fixed coupons before percent coupons on copies of the array, cap each discount at what is left, return early for an empty cart, and remove the invented API.",
    takeaways: [
      "AI-generated code is a draft: turn the prompt into tests and run them before trusting it.",
      "Check hallucinated APIs, mutation of arguments, boundaries (<= vs <) and empty inputs first.",
      "Money maths belongs in integer cents.",
    ],
  },
  expectedFailures: ["mutate", "fixed discounts", "expiry instant", "only stackable", "whole cents", "more than the cart", "empty cart"],
});
