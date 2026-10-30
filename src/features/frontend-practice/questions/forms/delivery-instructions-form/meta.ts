import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "delivery-instructions-form",
  title: "Gate code leaks into hand-delivered orders",
  topic: "forms",
  difficulty: "hard",
  minutes: 40,
  summary: "Dependent checkout fields: hidden values are validated and submitted, errors linger, and the form is not accessible.",
  scenario:
    "The checkout \"Delivery instructions\" step lets shoppers choose how the order is handed over. \"Leave at door\" reveals a gate code, \"Meet outside\" reveals a meeting spot, and \"Hand to me\" needs nothing extra. Drivers have started receiving gate codes for orders that are hand-delivered: shoppers type a code, change their mind, and the old value is still sent. Others can't place a hand-delivered order at all because the form insists on a gate code they cannot even see.\n\n" +
    "The accessibility audit adds that errors are not announced and not linked to their inputs, and customer support found duplicate orders when the button was double-clicked. The rules live in src/lib/deliveryInstructions.js, the form in src/components/DeliveryInstructionsForm.jsx. The parent supplies onSubmit(payload), which returns a promise.",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/pages/Addresses.tsx"],
  editableFiles: ["src/components/DeliveryInstructionsForm.jsx", "src/lib/deliveryInstructions.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Only the fields of the selected option are shown, validated and submitted.",
    "Hand to me → payload { option: \"hand\", notes }. Leave at door → also gateCode (4 to 6 digits, required). Meet outside → also meetingSpot (required).",
    "Switching option clears the previous option's value and any visible errors.",
    "Notes are optional, trimmed, at most 120 characters.",
    "An error is rendered in a role=\"alert\" element and its input has aria-invalid=\"true\" and aria-describedby pointing at that element.",
    "While submitting the button is disabled (\"Saving…\") and further submits are ignored. A failed submit shows a form-level error and re-enables the form.",
  ],
  reproSteps: [
    "Press Run, pick \"Leave at door\", type a gate code, then switch to \"Hand to me\" and submit: the JSON shown by the demo still contains the gate code.",
    "Reload with \"Hand to me\" selected and submit without typing anything: a gate code error blocks the submit.",
    "Pick \"Leave at door\", submit empty to see the error, then switch to \"Meet outside\": the old error is still there.",
  ],
  acceptanceCriteria: [
    "Validation and payload building are driven by the selected option.",
    "A 4–6 digit gate code is enforced; digits only.",
    "Option changes reset dependent values and errors.",
    "Errors are programmatically associated with inputs and announced.",
    "A pending submit blocks any further submit.",
  ],
  edgeCases: [
    "Gate code of 3 or 7 digits, or with letters",
    "Option switched after an error was shown",
    "Notes of exactly 120 vs 121 characters",
    "Second submit triggered programmatically while the first is pending",
    "onSubmit rejects",
  ],
  hints: [
    "Which of the three fields does the shopper actually see for the selected option? Is validateInstructions asking the same question?",
    "A payload builder should be driven by the option too: only include fields that belong to it. Also reset dependent state inside the option change handler instead of hoping the shopper retypes it.",
    "For accessibility give each error an id, render it with role=\"alert\", set aria-invalid on the input and point aria-describedby at the error id (only while the error exists). For double submits, return early at the top of the handler while `submitting` is true.",
  ],
  explanation: {
    rootCause:
      "The form treated all fields as always present. validateInstructions validated every field regardless of the selected option (blocking Hand to me), buildPayload copied every field into the payload (leaking stale hidden values), and nothing reset dependent state when the option changed. Errors were plain paragraphs without ids/roles and inputs had no ARIA wiring, and the submit handler relied only on the disabled attribute, so a second submit before React re-rendered slipped through.",
    fix: "Make the rules option-aware: validate only the visible field (gate code with /^\\d{4,6}$/, meeting spot required, notes length) and build the payload from the option. In the option change handler reset the dependent values and errors. Render each error with an id and role=\"alert\" and connect the input via aria-invalid + aria-describedby. Guard handleSubmit with `if (submitting) return` and keep the try/catch/finally that resets the flag.",
    takeaways: [
      "Dependent fields: validation, rendering and serialisation must all follow the same condition.",
      "Reset derived/dependent state when its controlling value changes.",
      "Accessible errors = id + role=alert + aria-invalid + aria-describedby.",
      "Disabled buttons are not a concurrency guard.",
    ],
  },
  expectedFailures: [
    "Hand to me",
    "4 to 6 digit",
    "hidden gate code",
    "clears errors",
    "screen readers",
    "second submit",
  ],
});
