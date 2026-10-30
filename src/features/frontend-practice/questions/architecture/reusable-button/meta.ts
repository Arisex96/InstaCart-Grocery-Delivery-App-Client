import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "reusable-button",
  title: "Shared Button swallows onClick and ignores loading",
  topic: "architecture",
  difficulty: "easy",
  minutes: 20,
  summary: "A new shared Button drops props, overwrites className and still fires while loading.",
  scenario:
    "The team is replacing the copy-pasted button markup (the green pill in ProductGrid's \"Clear All Filters\", the bordered \"Filters\" button and the red remove button in the cart) with one shared Button. The first version was merged and immediately caused bugs: handlers passed by callers never run, aria-labels disappear, a button placed in a form submits it by accident, and clicking a \"loading\" button still triggers the action.\n\n" +
    "Fix src/components/ui/Button.jsx so it behaves like a native <button> with a few extras, keeping the existing look of each variant.",
  inspiredBy: ["client/src/components/ProductGrid.tsx", "client/src/pages/Products.tsx", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/components/ui/Button.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Extra props (onClick, aria-label, disabled, title, data-*) reach the underlying <button>.",
    "A caller's className is added to the variant classes instead of replacing them.",
    "type defaults to \"button\" so it never submits a surrounding form by accident, but type=\"submit\" still works.",
    "loading shows a spinner, sets aria-busy, disables the button and prevents onClick; disabled does the same without the spinner.",
    "The variants primary, secondary and danger keep their distinct looks.",
  ],
  reproSteps: [
    "Press Run. Click the green \"Add one\" button: the counter does not change (onClick is dropped).",
    "Click \"Apply\" inside the demo form: the \"Form submitted\" message appears although it is a plain button.",
    "Click \"Save\" (loading) and \"Delete\" (disabled): both still increase the counter, and the full-width button ignores its w-full class.",
  ],
  acceptanceCriteria: [
    "onClick, aria-label and other native attributes work on every variant.",
    "className is merged, not replaced.",
    "Default type is \"button\"; an explicit type wins.",
    "loading and disabled both block clicks; loading also shows a spinner with aria-busy.",
  ],
  edgeCases: [
    "No className passed (no \"undefined\" in the class list)",
    "type=\"submit\" explicitly requested",
    "loading and disabled at the same time",
    "Children can be text or elements",
  ],
  hints: [
    "A component only passes through the props it destructures. How can you collect everything you did not name?",
    "Spread the collected props on the <button>, but think about which props must still win over them (e.g. `disabled` when loading).",
    "Join the variant classes and the caller's className with a space, skipping empty values.",
    "A native <button> inside a form defaults to type=\"submit\". Which default do you want for a reusable component?",
  ],
  explanation: {
    rootCause:
      "Button destructured only `variant`, `loading`, `children` and `className`, so every other prop (onClick, aria-label, disabled, type…) was silently dropped, and `className` replaced the variant classes instead of extending them. It set no `type` (browser default: submit) and `loading` only drew a spinner without disabling anything.",
    fix: "Collect the remaining props with `...rest` and spread them on the <button>, set `type` to \"button\" by default (rest can override it), compute `isDisabled = disabled || loading` and apply it, add aria-busy while loading, and join the variant classes with the caller's className.",
    takeaways: [
      "A reusable wrapper should behave like the element it wraps: forward rest props.",
      "Give wrappers safe defaults (type=\"button\") that callers can override.",
      "Merge className rather than replace it, so layout tweaks from callers work.",
    ],
  },
  expectedFailures: ["forwards", "merges", "type", "loading", "disabled"],
});
