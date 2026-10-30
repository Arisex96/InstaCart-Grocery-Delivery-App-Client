import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "order-summary-card",
  title: "Build the checkout order summary card",
  topic: "components",
  difficulty: "easy",
  kind: "build",
  minutes: 25,
  summary: "Render cart lines, subtotal, delivery fee, tax and total from props.",
  scenario:
    "The checkout page needs an order summary card next to the address form. Design handed over the layout and the pricing rules; the data comes from the cart (an array of { product, quantity }).\n\n" +
    "Implement OrderSummary in src/components/OrderSummary.jsx. The Demo on the right already passes sample carts, and the Target UI tab shows what the finished card should look like. Match it, then run the tests.",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/components/OrderSummary.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A white rounded card (rounded-2xl, border-app-border, p-5) with an <h2> titled \"Order summary\" in the serif font.",
    "One <li> per cart line inside a <ul>: the product name, then \"× <quantity>\" in muted text, and the line total on the right (price × quantity, \"$12.34\" with two decimals).",
    "Below a divider, a description list (<dl>) with rows: Subtotal, Delivery, Tax (18%), and Total. Each row is a <dt> label followed by a <dd> value; Total is bold and larger.",
    "Delivery costs $4.99, but shows \"Free\" (in green) when the subtotal is $50.00 or more. Below the threshold, show a hint line: \"Add $X.XX more for free delivery\".",
    "Tax is 18% of the subtotal, rounded to whole cents. Total = subtotal + delivery + tax.",
    "An empty cart shows the text \"Your cart is empty\" instead of the lines and totals.",
  ],
  expectedBehavior: [
    "Every number is formatted as dollars with two decimals and never shows floating point noise (e.g. $3.5999999).",
    "Changing the items (adding a line, changing a quantity) updates every figure.",
    "Exactly $50.00 counts as free delivery; $49.99 does not.",
  ],
  reproSteps: [
    "Press Run and look at the Demo: the card is only a stub.",
    "Open the Target UI tab to see the finished card for the same cart.",
    "Use the Demo buttons (Small cart, Big cart, Empty cart) to check the three states while you build.",
  ],
  acceptanceCriteria: [
    "Lines show name, quantity and line total for each item.",
    "Subtotal, Delivery, Tax (18%) and Total are rendered as <dt>/<dd> rows with the amounts above.",
    "Free delivery at >= $50.00 with no hint; below it a hint with the remaining amount.",
    "Empty cart shows \"Your cart is empty\" and no totals.",
  ],
  edgeCases: ["subtotal exactly 50.00 and 49.99", "prices like 1.2 × 3 (floating point)", "quantity 1 vs many", "empty items array"],
  hints: [
    "Compute everything in cents (Math.round(price * 100)) and format once at the end, so 1.2 × 3 never prints 3.5999999.",
    "Derive subtotal, delivery, tax and total from `items` during render; there is no need for state.",
    "A small helper like `row(label, value)` keeps the four <dt>/<dd> rows identical, and `Intl.NumberFormat` or `toFixed(2)` handles the dollars.",
  ],
  explanation: {
    rootCause: "There is no bug here: this is a build exercise. The main trap is money maths done in floating point and rounding in the wrong place.",
    fix: "Work in integer cents: line totals = round(price × 100) × quantity; subtotal is their sum; tax = round(subtotal × 0.18); delivery is 499 cents below the 5000 cent threshold, otherwise free. Everything is derived from props during render and formatted at the edge.",
    takeaways: [
      "Derive values from props instead of copying them into state.",
      "Do money maths in integer cents, format only for display.",
      "Boundary values (exactly $50.00) deserve an explicit test.",
    ],
  },
  expectedFailures: ["subtotal", "delivery", "empty"],
});
