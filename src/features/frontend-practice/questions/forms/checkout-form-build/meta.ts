import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "checkout-form-build",
  title: "Build the checkout form with validation and an async order",
  topic: "forms",
  difficulty: "hard",
  kind: "build",
  minutes: 55,
  summary: "Address + payment form with inline validation, a Place order flow, and success/failure states.",
  scenario:
    "Checkout is the last screen before an order is placed, so mistakes here cost real money. Design wants an address form with friendly inline validation, a payment method choice (the card field only appears for card payments), the order total, and a clear result after pressing Place order.\n\n" +
    "Build CheckoutForm (src/components/CheckoutForm.jsx) and the validation helpers it uses (src/lib/checkoutValidation.js). The Demo lets you pick how the order request behaves (succeeds, slow, fails, fails once) and logs the payload to the Console; the Target UI tab shows the finished screen.",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/pages/Addresses.tsx"],
  editableFiles: ["src/components/CheckoutForm.jsx", "src/lib/checkoutValidation.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "CheckoutForm props: items ([{ product: { price }, quantity }]) and placeOrder(payload) (returns a promise resolving to { id }). It renders <form aria-label=\"Checkout\"> with text inputs labelled \"Full name\", \"Street address\", \"City\", \"ZIP code\" and \"Phone number\".",
    "A <fieldset> with <legend>Payment method</legend> and two radios labelled \"Card\" and \"Cash on delivery\" (Cash on delivery is selected by default). Only when Card is selected a text input labelled \"Card number\" is shown.",
    "Order summary: a <dl> with <dt>Items</dt> (total number of units) and <dt>Total</dt> (sum of price × quantity, formatted \"$23.60\"), each followed by its <dd>.",
    "Validation messages (exact text): name \"Enter your full name\"; address \"Enter your street address\"; city \"Enter your city\"; zip empty \"Enter your ZIP code\", otherwise \"ZIP code must be 5 digits\"; phone empty \"Enter your phone number\", otherwise \"Enter a valid phone number\" (10 digits after removing non-digits); card number empty \"Enter your card number\", otherwise \"Card number must be 16 digits\" (spaces are ignored).",
    "A field shows its error after it was blurred or after a submit attempt, and updates live while editing. An invalid field has aria-invalid=\"true\" and aria-describedby pointing to its error element, which has role=\"alert\". Valid fields have no error element.",
    "A submit button \"Place order\". Invalid submit: all errors appear and placeOrder is NOT called. Valid submit: placeOrder is called once with { name, address, city, zip, phone, payment: \"card\" | \"cod\", cardNumber (digits only, card only), total } (strings trimmed, total in dollars rounded to cents).",
    "While the request is pending the button is disabled and reads \"Placing order…\"; extra submits are ignored. On success the form is replaced by <p role=\"status\">Order placed! #<id></p>. On failure show an element with role=\"alert\" saying \"Could not place order\", keep every typed value, re-enable the button and allow retrying.",
  ],
  expectedBehavior: [
    "Switching payment to Cash on delivery hides the card field and a bad card number no longer blocks the order.",
    "The payload never contains a card number for cash orders, and the card number contains only digits.",
    "Retrying after a failure sends the same data again.",
  ],
  reproSteps: [
    "Press Run, then open the Target UI tab and try the finished form: tab through the empty fields, then press Place order.",
    "Fill the form with valid data and watch the Console tab: the payload is logged by the Demo's placeOrder.",
    "Switch the Demo to \"Fails once\" and place the order twice to see the failure state and the retry.",
  ],
  acceptanceCriteria: [
    "Every field and message follows the spec (labels, exact texts, aria attributes).",
    "Validation lives in src/lib/checkoutValidation.js (validateField, validateForm) and is unit-testable.",
    "Payload shape, trimming, digits-only card number and total are correct.",
    "Pending, success and failure states work; double submits are impossible.",
  ],
  edgeCases: [
    "ZIP \"1234\", \"123456\", \"12a45\"",
    "Phone \"(555) 123-4567\" is valid, \"12345\" is not",
    "Card number \"4242 4242 4242 4242\" is valid; \"4242\" is not",
    "Switching Card -> Cash with an invalid card number typed",
    "Two submit events in the same tick",
  ],
  hints: [
    "Write the validators first as pure functions: validateField(name, value) returns an error string or \"\", validateForm(values) returns { field: message } for failing fields only (and only checks cardNumber for card payments).",
    "Do not store errors in state. Keep values, a `touched` map and a `submitted` flag, compute errors from the values on every render, and show an error when touched || submitted.",
    "Use a ref (not only state) as the in-flight guard: two submit events in one tick both see the same stale `status` state.",
    "Give each error element an id (e.g. `${name}-error`) and point aria-describedby at it only while it is rendered.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise. The main trap is state that can drift: storing errors separately from values means they go stale. A second trap is relying on a state flag for double-submit protection, which does not update until the next render.",
    fix:
      "Keep validators pure in their own module. In the component hold only values, touched and submitted, derive the errors during render, and guard submission with a ref. Build the payload from trimmed values, convert the card number to digits, compute the total in cents, and drive pending/success/failure from a single status value.",
    takeaways: [
      "Derive validation results from values; do not mirror them into state.",
      "Pure validator functions are trivially testable and reusable.",
      "A ref is the right tool for an in-flight guard that must flip synchronously.",
      "Associate errors with inputs using aria-invalid + aria-describedby + role=alert.",
    ],
  },
  expectedFailures: ["order total", "after blur", "invalid form", "success", "validateField"],
});
