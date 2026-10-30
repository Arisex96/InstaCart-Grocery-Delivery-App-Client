import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "search-suggestions-dropdown",
  title: "Build the navbar search with a suggestions dropdown",
  topic: "forms",
  difficulty: "medium",
  kind: "build",
  minutes: 45,
  summary: "An accessible combobox: debounced suggestions, keyboard navigation, highlighted matches.",
  scenario:
    "The navbar search box only submits on Enter. Product wants live suggestions: as the shopper types, a dropdown lists up to five matching products, they can move through it with the arrow keys, press Enter to pick one, and Escape to dismiss it.\n\n" +
    "Implement SearchSuggestions in src/components/SearchSuggestions.jsx. It fetches suggestions with api.get(\"/products\", { params: { search } }) (response: { data: { products } }, products have `id`, `name`, `price`) after a debounce, and calls onSelect(product) when one is chosen. The Demo shows the picked product, and the Target UI tab shows the finished dropdown.",
  inspiredBy: ["client/src/components/Navbar.tsx", "client/src/hooks/useDebounce.ts"],
  editableFiles: ["src/components/SearchSuggestions.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js", "src/hooks/useDebounce.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A search input styled like the navbar search (rounded-full, border-app-border, a Search icon on the left) with role=\"combobox\", accessible name \"Search products\", aria-autocomplete=\"list\", and aria-expanded=\"true\"/\"false\" reflecting whether the dropdown is open.",
    "The dropdown is a <ul role=\"listbox\"> rendered only while open; the input's aria-controls equals the listbox id. Each suggestion is an <li role=\"option\"> with the product name and price (\"$3.50\"); at most 5 suggestions are shown.",
    "The part of the name that matches the query (case-insensitive) is wrapped in <strong>, keeping the name's original capitalisation (query \"ban\" on \"Organic Bananas\" bolds \"Ban\").",
    "The active suggestion has aria-selected=\"true\" and its id is the input's aria-activedescendant (no attribute when nothing is active). ArrowDown/ArrowUp move the active option and wrap around; Enter picks the active option; Escape closes the dropdown.",
    "Non-option rows inside the listbox (role=\"presentation\"): \"Searching…\" while a request is pending, \"No matches\" when the result is empty, and \"Could not load suggestions\" when the request fails.",
    "Picking an option calls onSelect(product), puts the product name in the input and closes the dropdown. Empty or blank input keeps the dropdown closed.",
  ],
  expectedBehavior: [
    "Requests fire only after the user stops typing for `debounceMs` (default 250 ms) and use the trimmed text as `search`.",
    "Only the response for the latest query is ever shown; older responses are ignored.",
    "Typing after Escape or after picking an option reopens the dropdown.",
  ],
  reproSteps: [
    "Press Run and type in the Demo: the input is only a plain text box.",
    "Open the Target UI tab, type \"ba\", use the arrow keys and Enter, and try Escape.",
    "Use the Demo buttons (Fast, Slow, Failing) to check the Searching…, results and error rows.",
  ],
  acceptanceCriteria: [
    "The input and dropdown expose the combobox/listbox/option roles and aria attributes exactly as specified.",
    "Arrow keys wrap, Enter selects the active option (and does nothing when none is active), Escape closes.",
    "At most 5 options; matched text bolded; price shown.",
    "Searching…, No matches and Could not load suggestions rows appear in the right situations.",
    "Stale responses never replace newer suggestions.",
  ],
  edgeCases: [
    "ArrowUp when nothing is active selects the last option",
    "Enter with no active option",
    "A slow response for \"ba\" arriving after \"banana\"",
    "A query with regex characters such as \"c++\" or \"(\"",
    "Product names that contain the query more than once",
  ],
  hints: [
    "useDebounce(query, debounceMs) gives you the value to search for; fetch in an effect on the debounced value and drop stale results with a per-run `ignore` flag.",
    "Keep `activeIndex` (-1 = none) and `open` in state. Reset activeIndex whenever new results arrive, and derive aria-activedescendant from it.",
    "To highlight safely, find the match with toLowerCase().indexOf(query) and slice the original name into before / match / after instead of building a RegExp from user input.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise, so there is no bug. The main traps are the accessibility contract (the combobox attributes must track state) and out-of-order responses.",
    fix: "Keep query, open, activeIndex, results and status in state. Debounce the query, fetch in an effect with an ignore flag, and handle ArrowUp/ArrowDown/Enter/Escape in onKeyDown. Derive aria-expanded, aria-controls and aria-activedescendant from state, and highlight by slicing the original string around the first case-insensitive match.",
    takeaways: [
      "ARIA attributes are state: derive them, do not set them imperatively.",
      "Never build a RegExp from user text; slice by index instead.",
      "Debounce plus an ignore flag is the standard pattern for typeahead.",
    ],
  },
  expectedFailures: ["combobox", "arrow", "Enter", "Escape", "stale"],
});
