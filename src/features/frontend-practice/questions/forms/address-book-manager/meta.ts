import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "address-book-manager",
  title: "Build the saved addresses manager",
  topic: "forms",
  difficulty: "medium",
  kind: "build",
  minutes: 35,
  summary: "List, add, edit, delete and default-select delivery addresses with validation.",
  scenario:
    "The account area needs an address book where shoppers manage the places they get groceries delivered to. They can add a new address, edit an existing one, delete one (after confirming) and choose exactly one default address that checkout will preselect.\n\n" +
    "Implement AddressBook in src/components/AddressBook.jsx. It keeps the list in its own state, starting from the `initialAddresses` prop, and reports every change through `onChange(addresses)`. The Demo shows a book with addresses and an empty one; the Target UI tab shows the finished design.",
  inspiredBy: ["client/src/pages/Addresses.tsx", "client/src/pages/Checkout.tsx"],
  editableFiles: ["src/components/AddressBook.jsx"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A <section aria-label=\"Saved addresses\"> with an <h2> \"Saved addresses\" and an \"Add address\" button. Addresses are in a <ul aria-label=\"Addresses\">, one <li> per address.",
    "Each card shows the label in bold, the street line, and \"City, ST 12345\" (city, comma, state, space, zip). The default address also shows a \"Default\" badge (exact text \"Default\"); exactly one address is the default at any time.",
    "Each card has buttons with accessible names \"Edit <label>\", \"Delete <label>\" and, on non-default cards only, \"Set <label> as default\".",
    "With no addresses, show the text \"No saved addresses\" instead of the list.",
    "\"Add address\" and \"Edit <label>\" open a <form aria-label=\"Address form\"> with text inputs labelled \"Label\", \"Street address\", \"City\", \"State\" and \"ZIP code\" (Edit prefills them) and buttons \"Save address\" and \"Cancel\".",
    "On submit, validate: every field required, State is exactly 2 letters, ZIP code is exactly 5 digits. Show each message in an element with role=\"alert\" (\"Label is required\", \"Street address is required\", \"City is required\", \"State must be 2 letters\", \"ZIP code must be 5 digits\") and mark the field aria-invalid=\"true\". Nothing is saved while invalid.",
    "\"Delete <label>\" shows, inside that card, the text \"Delete this address?\" with buttons \"Yes\" and \"No\". Yes removes it (if it was the default, the first remaining address becomes the default); No keeps it.",
  ],
  expectedBehavior: [
    "Saving a new address appends it; the very first address saved into an empty book becomes the default. State is stored upper-cased (\"ny\" becomes \"NY\").",
    "Saving an edit updates the address in place and keeps its default flag.",
    "onChange is called with the full, updated array after every add, edit, delete and default change.",
  ],
  reproSteps: [
    "Press Run: the skeleton shows only a heading and an inert Add address button.",
    "Open the Target UI tab, click Add address, submit the empty form to see the validation messages, then add an address.",
    "Use the Demo's \"With addresses\" and \"Empty book\" buttons to check both starting states.",
  ],
  acceptanceCriteria: [
    "Cards show label, street, \"City, ST 12345\" and a single Default badge; empty state text appears for an empty book.",
    "The form validates as specified, shows alerts with aria-invalid and does not save invalid data; Cancel closes it without changes.",
    "Add, edit (prefilled, in place), delete-with-confirmation and set-as-default all work and keep exactly one default.",
    "onChange receives the updated array after each change.",
  ],
  edgeCases: [
    "deleting the default address promotes the first remaining one",
    "deleting the only address leaves the empty state",
    "editing the default address keeps it default",
    "zip with letters or 4 digits; state with 3 letters",
    "state typed in lower case",
  ],
  hints: [
    "Keep the addresses array in state, plus small UI state: which address is being edited (or a new one) and which one is awaiting delete confirmation. The form fields and errors are their own state inside a form component.",
    "Give the form `key={editingId ?? 'new'}` so it starts fresh (or prefilled) every time it opens, and call `event.preventDefault()` in the submit handler before validating.",
    "Write one `commit(next)` helper that sets state and calls `onChange?.(next)`; add, edit, delete and set-default then only differ in how they build `next`. To keep exactly one default, map the whole array: `isDefault: a._id === id`.",
  ],
  explanation: {
    rootCause:
      "There is no bug: this is a build exercise. The main traps are forgetting to keep exactly one default when deleting, mutating the state array in place, and validating on every keystroke instead of on submit.",
    fix: "Hold the list in state with a single `commit` helper, derive each change immutably (map/filter/spread), and put the form in its own component with local values and errors, re-created via a key. Validate in the submit handler and only call commit when there are no errors.",
    takeaways: [
      "Funnel every state change through one function so side effects like onChange cannot be forgotten.",
      "Re-key a form to reset or prefill it instead of syncing props into state with effects.",
      "Invariants (one default) are easiest to keep by recomputing the whole array.",
    ],
  },
  expectedFailures: ["lists each", "empty state", "validation", "delete"],
});
