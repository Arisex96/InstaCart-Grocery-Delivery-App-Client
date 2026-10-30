import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "checkout-promo-code-form",
  title: "Promo code box can't be typed into",
  topic: "forms",
  difficulty: "easy",
  minutes: 15,
  summary: "A controlled input without onChange, a submit that reloads the page, and no validation.",
  scenario:
    "The new \"Have a promo code?\" box on the checkout order summary shipped this morning and QA bounced it immediately: the input does not accept any characters, pressing Enter reloads the whole checkout page, and clicking Apply with an empty box happily sends an empty code to the server.\n\n" +
    "PromoCodeForm follows the styling of the checkout summary card. Make it a proper controlled form. The parent decides whether a code is valid: it passes onApply(code), which may return an error message (a string) for an invalid code.",
  inspiredBy: ["client/src/pages/Checkout.tsx", "client/src/components/CartSideBar.tsx"],
  editableFiles: ["src/components/PromoCodeForm.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The shopper can type; the input shows exactly what was typed.",
    "Submitting (button or Enter) does not reload the page.",
    "onApply receives the code trimmed and upper-cased (\"  fresh10 \" → \"FRESH10\").",
    "A blank code shows \"Enter a promo code\" and onApply is not called.",
    "If onApply returns a string, it is shown as the error. The error disappears as soon as the shopper edits the code.",
    "While `applying` is true the button is disabled and reads \"Applying…\".",
  ],
  reproSteps: [
    "Press Run and try to type \"fresh10\" into the promo box: nothing appears.",
    "Click Apply with an empty box: the order summary receives an empty code (see \"Last code sent\").",
    "Press Enter inside the box: the page behaves like a classic form post instead of staying put.",
  ],
  acceptanceCriteria: [
    "The input is controlled: its value comes from state and onChange updates that state.",
    "The submit handler prevents the browser default.",
    "Blank (or whitespace-only) codes are rejected with an inline, accessible error.",
    "The normalised code is passed to onApply exactly once per submit.",
    "An error returned by onApply is rendered and cleared on the next edit.",
  ],
  edgeCases: [
    "Code consisting only of spaces",
    "Mixed-case code with surrounding whitespace",
    "onApply returns a string vs. returns nothing",
    "Error visible, then the shopper types again",
  ],
  hints: [
    "React only lets the user type into an input whose `value` is paired with an `onChange` that updates the state it reads.",
    "A form's submit event navigates by default. Which method on the event stops that?",
    "Normalise once (trim + toUpperCase) and use the result for both the validation and the call to onApply. Clear the error in onChange.",
  ],
  explanation: {
    rootCause:
      "The input had `value={code}` but no onChange handler, so React kept re-rendering it with the empty state value and swallowed every keystroke. The submit handler never called event.preventDefault(), so the browser performed its default form submission, and nothing validated the code before it was sent.",
    fix: "Add onChange={(e) => setCode(e.target.value)} (and clear any error), call e.preventDefault() in the submit handler, normalise with trim().toUpperCase(), reject empty codes with an error rendered in a role=\"alert\" element, show whatever string onApply returns, and honour the `applying` prop on the button.",
    takeaways: [
      "A controlled input needs both value and onChange.",
      "Always preventDefault in a JS-handled form submit.",
      "Validate the normalised value, and send that same value on.",
    ],
  },
  expectedFailures: ["type a code", "page reload", "trimmed", "blank", "clears the error", "message returned", "Applying"],
});
