import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "admin-product-form-numbers",
  title: "Admin product form saves zero prices and NaN stock",
  topic: "forms",
  difficulty: "medium",
  minutes: 30,
  summary: "Number fields are coerced on every keystroke, validation is missing and the organic checkbox is mis-wired.",
  scenario:
    "The admin team created a \"Free Range Eggs\" product with price $0.00, a milk carton with stock NaN, and an organic flag that arrived on the server as the string \"on\". Admins also complain that they cannot clear the price box: deleting the last digit puts a 0 back, so typing 12 gives 012.\n\n" +
    "ProductForm is a trimmed version of the form in src/pages/admin/AdminProductForm.tsx. The real form keeps every field as a string in state and parses on submit; this copy converts values while typing instead. The payload shape is the one the real form sends to api.post(\"/products\"). The number fields are text inputs with inputMode=\"decimal\", as recommended for prices.",
  inspiredBy: ["client/src/pages/admin/AdminProductForm.tsx", "client/src/pages/Checkout.tsx"],
  editableFiles: ["src/components/ProductForm.jsx", "src/lib/productForm.js"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Price, original price and stock start empty and can be cleared and retyped freely.",
    "Submitting with a blank, negative or non-numeric price, or a stock that is not a whole number >= 0, shows an error and does not call onSubmit.",
    "A blank original price defaults to the price; an original price below the price is rejected.",
    "The payload has trimmed text, prices rounded to cents, an integer stock and a real boolean for isOrganic.",
    "The save button is disabled while onSubmit is pending, and a failed save shows its message.",
  ],
  reproSteps: [
    "Press Run and look at the Price box: it shows 0 instead of being empty. Type 12, then delete both digits: a 0 comes back.",
    "Leave the price at 0, fill the name and category and press Save: the payload in the preview shows price 0.",
    "Tick \"Organic\" and save: isOrganic in the payload is the text \"on\".",
    "Type 2.5 into Stock and save: it is accepted and sent as 2 (or NaN when empty).",
  ],
  acceptanceCriteria: [
    "Number inputs hold what the admin typed (strings) and are parsed only when building the payload.",
    "validateProduct returns an error message per invalid field and an empty object for valid input.",
    "buildProductPayload returns the exact payload shape documented in the file.",
    "The checkbox is a controlled `checked` input producing true/false.",
  ],
  edgeCases: [
    "Price \"abc\", \"-1\", \"\" and \"0\"",
    "Stock \"2.5\", \"-4\" and \"\"",
    "Price with more than 2 decimals (3.456 -> 3.46)",
    "Whitespace-only name",
    "Original price lower than price",
  ],
  hints: [
    "What value does Number(\"\") return, and what does a controlled input do with the value you give it back?",
    "Keep the typed text (a string) in state for every field. Convert only inside buildProductPayload, after validateProduct has accepted the text.",
    "validateProduct needs to look at Number(...) for each numeric string: reject NaN, negatives and (for stock) non-integers; decide separately what \"0\" means for price.",
    "A checkbox reads `e.target.checked` and is rendered with `checked=`, not `value=`.",
  ],
  explanation: {
    rootCause:
      "The form converted values while typing (`Number(e.target.value)`), so an empty box became 0 and the controlled input could never be empty; \"abc\" became NaN. validateProduct only checked the name and category, and buildProductPayload trusted whatever was in state. The checkbox used `value`/`e.target.value`, which is always the string \"on\".",
    fix: "Store every field as the string the admin typed. validateProduct parses with Number() and reports a message per invalid field; buildProductPayload rounds money to cents, parses stock as an integer and trims text. The checkbox is controlled with `checked` and stores `e.target.checked`.",
    takeaways: [
      "Form state is the user's text; parse and validate at the boundary, not on every keystroke.",
      "Number(\"\") is 0 and Number(\"abc\") is NaN: check input explicitly before converting.",
      "Checkboxes use `checked`/`e.target.checked`, text inputs use `value`/`e.target.value`.",
    ],
  },
  expectedFailures: ["cleared and retyped", "blank price", "checkbox"],
});
