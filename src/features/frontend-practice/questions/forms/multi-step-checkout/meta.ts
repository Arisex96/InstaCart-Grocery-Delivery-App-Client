import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "multi-step-checkout",
  title: "Multi-step checkout skips validation, forgets the address and double-orders",
  topic: "forms",
  difficulty: "hard",
  minutes: 45,
  summary: "A three-step checkout wizard (address, delivery slot, review) with per-step validation, remembered state and a safe async submit.",
  scenario:
    "The checkout was split into three steps: address, delivery slot, review. QA's bug list after the first build:\n\n" +
    "\"Next works with an empty form and I reached the review page with no address. Going Back from the delivery step shows an empty address form again. I tapped Place order twice on a slow connection and got two orders. When the server rejected the order, the button said 'Placing order…' forever and there was no error.\"\n\n" +
    "The step forms (AddressStep, SlotStep, ReviewStep) and validators.js are finished and read-only. Fix CheckoutWizard.jsx (navigation, validation, remembered state) and useCheckoutOrder.js (the async submit).",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/pages/Addresses.tsx", "client/src/store/useCartStore.ts"],
  editableFiles: ["src/components/CheckoutWizard.jsx", "src/hooks/useCheckoutOrder.js"],
  shared: ["src/api/axios.js", "src/data/products.js", "src/store/useCartStore.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Next on the address step validates with validateAddress: it shows the field errors and stays on the step. Next on the delivery step needs a slot (validateSlot).",
    "Back never loses what was entered: the address fields and the chosen slot are still there.",
    "Place order sends the address, slot and cart total to POST /orders exactly once, even if clicked twice; the button reads \"Placing order…\" and is disabled meanwhile.",
    "If the request fails, an error is shown (\"Could not place your order…\"), the button works again and the cart is untouched. On success the cart is cleared and \"Order placed\" is shown.",
  ],
  reproSteps: [
    "Press Run and click Next on the empty address form: you land on step 2 instead of seeing errors.",
    "Fill the address, click Next, then Back: the address form is empty again.",
    "Go to the review step and click Place order twice quickly: the order counter under the wizard shows 2 requests.",
    "Tick \"Make the next order fail\", click Place order: the button stays on \"Placing order…\" and nothing explains why.",
  ],
  acceptanceCriteria: [
    "Validation uses validateAddress / validateSlot and blocks Next; errors clear when the step is valid.",
    "AddressStep receives the saved address as initialValues so Back restores it; the slot survives navigation.",
    "A second Place order while one is pending never reaches the api (guard in the hook, disabled button in the UI).",
    "A failed order sets an error and re-enables the button; a successful one clears the cart and shows the order id.",
  ],
  edgeCases: [
    "A ZIP code with 4 digits or letters",
    "Clicking Place order twice in the same tick",
    "Failing, then retrying successfully",
    "Going back and forth several times",
  ],
  hints: [
    "src/lib/validators.js is not imported anywhere yet. Where should it run, and what has to happen when it reports a problem?",
    "AddressStep keeps its own copy of the fields (useState(initialValues)). What is the wizard passing as initialValues, and where does it store what the shopper typed?",
    "A boolean state variable updates on the NEXT render, so two clicks in the same tick both see `false`. What survives synchronously between calls: a ref?",
    "Anything awaited can reject: use try / catch / finally so the pending state always ends, and keep the error for the UI.",
  ],
  explanation: {
    rootCause:
      "The wizard never called the validators, so every Next succeeded; it rendered AddressStep with empty initialValues and never saved the typed values, so Back remounted an empty form. useCheckoutOrder set `submitting` but never checked it, awaited the api without try/catch (a rejection skipped the line that resets `submitting`, leaving the UI stuck) and exposed no error.",
    fix: "Run validateAddress/validateSlot in next() and store the errors; keep the address in wizard state and pass it back as initialValues; guard placeOrder with a ref (state is not updated synchronously) and disable the button; wrap the request in try/catch/finally to set an error and always reset the pending flag.",
    takeaways: [
      "State that must survive step changes lives in the parent, not in the step that unmounts.",
      "Use a ref for \"already running\" guards; React state is asynchronous.",
      "Always reset pending flags in finally and surface failures to the shopper.",
    ],
  },
  expectedFailures: ["blocks Next", "going back", "only once", "failed order", "without a delivery slot"],
});
