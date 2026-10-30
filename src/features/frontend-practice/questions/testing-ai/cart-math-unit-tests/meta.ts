import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "cart-math-unit-tests",
  title: "Write unit tests that catch cart pricing bugs",
  topic: "testing-ai",
  difficulty: "easy",
  mode: "write-tests",
  minutes: 20,
  summary: "Test cartMath so that every planted pricing bug makes your suite fail.",
  scenario:
    "Last month an assistant-generated refactor of the checkout maths slipped through review because the only test was \"total is greater than 0\". The price rules live in client/src/pages/Checkout.tsx: delivery is $2 unless the order is above $50, and tax is 18%. They have now been extracted into a pure module, src/lib/cartMath.js.\n\n" +
    "Write a real test suite for it. When you press Run Tests, your file is executed against the correct implementation (it must pass) and then against several copies with one bug planted in each (your suite must fail on every one).",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/__tests__/cartMath.test.jsx"],
  expectedBehavior: [
    "Your tests pass against the untouched cartMath.js.",
    "For each planted bug, at least one of your tests fails.",
  ],
  reproSteps: [
    "Open the src/lib/cartMath.js tab and read the rules in the header comment.",
    "Press Run Tests with the starter: the weak test passes, but several \"Seeded bugs\" are reported as not caught.",
    "Pick one reported bug, think about which input would make correct and buggy code differ, and add an assertion for it.",
  ],
  acceptanceCriteria: [
    "All of your tests pass on the correct implementation.",
    "Every seeded bug is caught by at least one failing test.",
    "Each test has a name that states the rule it checks.",
  ],
  edgeCases: [
    "Exactly at the free-delivery threshold (50.00) and just above it",
    "Discount percentages below 0 and above 100",
    "An empty cart",
    "Amounts that do not divide into whole cents",
    "A discount that moves the order across the free-delivery threshold",
  ],
  hints: [
    "Boundary values find bugs that \"typical\" inputs miss: test the exact threshold, one cent below and one cent above.",
    "For each function, ask what the rule is, then choose an input where a plausible wrong implementation would give a different answer.",
    "Use numbers where the order of operations matters (discount first, then delivery and tax) and numbers that need rounding, like 3.33 at 18% tax.",
  ],
  explanation: {
    rootCause:
      "A single happy-path assertion (\"total > 0\") exercises almost none of the logic, so any change to rounding, boundaries, clamping or the order of operations goes unnoticed.",
    fix: "Write one focused test per rule using inputs chosen to separate the correct behaviour from the likely mistakes: boundary values (50.00 vs 50.01), out-of-range inputs (150%), the empty case, a discount that changes the delivery decision, and amounts that need rounding.",
    takeaways: [
      "Test boundaries and rules, not just a typical value.",
      "Mutation-style thinking (\"what bug would my test miss?\") is a fast way to find missing tests.",
      "Assert exact values for money: toBe(8.64), not toBeGreaterThan(0).",
    ],
  },
  mutants: [
    {
      name: "Catches a free-delivery edge case",
      file: "src/lib/cartMath.js",
      find: "sub > FREE_DELIVERY_THRESHOLD",
      replace: "sub >= FREE_DELIVERY_THRESHOLD",
      hint: "What should an order of exactly $50.00 pay for delivery?",
    },
    {
      name: "Catches an out-of-range discount",
      file: "src/lib/cartMath.js",
      find: "Math.min(100, Math.max(0, percent))",
      replace: "Math.max(0, percent)",
      hint: "Try a discount larger than 100%.",
    },
    {
      name: "Catches a problem with an empty cart",
      file: "src/lib/cartMath.js",
      find: "if (sub <= 0) return 0;",
      replace: "",
      hint: "What should orderTotal([]) return?",
    },
    {
      name: "Catches a mistake about which amount tax applies to",
      file: "src/lib/cartMath.js",
      find: "round2(discounted * TAX_RATE)",
      replace: "round2(sub * TAX_RATE)",
      hint: "Use a discount and check the tax value.",
    },
    {
      name: "Catches a mistake in when delivery is decided",
      file: "src/lib/cartMath.js",
      find: "deliveryFee(discounted)",
      replace: "deliveryFee(sub)",
      hint: "Pick a subtotal above $50 that drops below it after the discount.",
    },
    {
      name: "Catches a rounding problem",
      file: "src/lib/cartMath.js",
      find: "Math.round((n + Number.EPSILON) * 100) / 100",
      replace: "Math.floor(n * 100) / 100",
      hint: "Use an amount whose tax has more than two decimals.",
    },
  ],
  expectedFailures: ["free-delivery edge case", "out-of-range discount", "empty cart", "tax applies to", "rounding"],
});
