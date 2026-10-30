import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "address-form-validation",
  title: "Address form shouts errors at once and gets stuck saving",
  topic: "forms",
  difficulty: "medium",
  minutes: 30,
  summary: "Validation shows before interaction, ZIP/state/coordinates are unchecked, isDefault becomes \"on\", and a failed save locks the form.",
  scenario:
    "The \"Add address\" modal (a simplified AddressForm from the Addresses page) has a list of complaints: it opens covered in red \"is required\" messages, a ZIP like \"abc\" or a state like \"California\" is accepted, coordinates outside the valid range reach the server, ticking \"Set as default\" saves the string \"on\" instead of true, and when the server rejects a save the Save button stays disabled forever. Double-clicking Save creates duplicate addresses.\n\n" +
    "Validation rules live in src/lib/validateAddress.js; the form in src/components/AddressForm.jsx wires them to the inputs. Both need changes. The save call is injected as onSave(address) (returns a promise) so the form never talks to the network directly.",
  inspiredBy: ["client/src/pages/Addresses.tsx", "client/src/pages/Checkout.tsx"],
  editableFiles: ["src/components/AddressForm.jsx", "src/lib/validateAddress.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "No error is shown until the shopper leaves a field (blur) or tries to submit.",
    "Required: label, street address, city, state, ZIP. State must be 2 letters (saved upper-case). ZIP must be 12345 or 12345-6789.",
    "Latitude must be between -90 and 90 and longitude between -180 and 180 (both optional; blank saves as 0).",
    "Submitting an invalid form shows every error and does not call onSave.",
    "onSave receives { label, address, city, state, zip, isDefault, lat, lng } with a real boolean isDefault and numeric lat/lng.",
    "While saving the button is disabled and reads \"Saving…\"; a second submit is ignored. If onSave rejects, an error is shown and the form works again.",
  ],
  reproSteps: [
    "Press Run: the form opens already full of red \"is required\" errors.",
    "Fill valid data with ZIP \"abc\", state \"California\", latitude 95 and press Save: it is accepted.",
    "Tick \"Set as default\", use label \"fail\" (the demo server rejects it) and press Save: the button stays on \"Saving…\" forever.",
  ],
  acceptanceCriteria: [
    "Errors appear per field only after it was touched, or for all fields after a submit attempt.",
    "validateAddress enforces the state, ZIP and coordinate rules with clear messages.",
    "The payload has isDefault: true/false, state in upper case and lat/lng as numbers.",
    "Double submits are ignored and a rejected save re-enables the form with a visible error.",
  ],
  edgeCases: [
    "ZIP+4 (94043-1234)",
    "Lower-case state code (\"ca\")",
    "Latitude exactly 90 / longitude exactly -180",
    "Blank coordinates",
    "Submit pressed twice before the first save finishes",
  ],
  hints: [
    "Right now `errors` is computed from the form data on every render and printed unconditionally. What extra state would tell you which fields the shopper has already visited?",
    "Checkbox inputs report their state in `checked`, not in `value`. Check how handleChange distinguishes input types.",
    "A flag set before an `await` must be reset on every path out: success, failure and early return. Think about `try/catch/finally` – and about guarding at the top of the handler, not only with `disabled`.",
  ],
  explanation: {
    rootCause:
      "Several independent form bugs: (1) errors were derived and displayed on every render without tracking touched/submitted state; (2) validateAddress only checked for empty strings, so ZIP, state and coordinate rules did not exist; (3) handleChange read `value` for checkboxes, which is the constant string \"on\"; (4) setSubmitting(true) was never undone when onSave threw and the submit handler had no `if (submitting) return` guard, so programmatic or rapid second submits slipped past the disabled button.",
    fix: "Track `touched` (on blur) and `submitAttempted`, show an error only when its field is touched or a submit was attempted. Extend validateAddress with the state/ZIP/lat/lng rules. Use `checked` for checkboxes. In handleSubmit: preventDefault, return early while submitting, set submitAttempted, bail out on errors, then try/catch/finally around onSave so the flag is always reset and failures show a message. Normalise the payload (upper-case state, numeric lat/lng).",
    takeaways: [
      "Separate \"is it valid?\" (derived) from \"should I show the error yet?\" (touched / submitted state).",
      "Checkbox → `checked`, text → `value`.",
      "Guard async submits in the handler itself and reset flags in `finally`.",
    ],
  },
  expectedFailures: [
    "before the user interacts",
    "malformed ZIP",
    "2-letter state",
    "latitude and longitude",
    "boolean isDefault",
    "second submit",
    "saving fails",
  ],
});
