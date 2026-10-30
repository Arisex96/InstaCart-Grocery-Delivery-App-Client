import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "navbar-search-url-sync",
  title: "Browser Back is trapped by the search box",
  topic: "hooks-effects",
  difficulty: "hard",
  minutes: 35,
  summary: "A debounced search box and the ?search= URL parameter fight each other, so Back snaps forward again.",
  scenario:
    "Shoppers report that the browser Back button \"does nothing\" on the Products page after they searched twice: they press Back, the box briefly shows the previous search and then jumps back to the latest one. Searching for text with an ampersand (\"fish & chips\") and pressing Enter also finds the wrong thing.\n\n" +
    "SearchBar is the search part of the Navbar (src/components/Navbar.tsx): the box mirrors the ?search= URL parameter, typing updates the URL after a debounce, and Enter searches immediately. Someone added `urlSearch` to the dependency array of the navigation effect to silence the exhaustive-deps lint rule.",
  inspiredBy: ["client/src/components/Navbar.tsx", "client/src/hooks/useDebounce.ts"],
  editableFiles: ["src/components/SearchBar.jsx"],
  shared: ["src/hooks/useDebounce.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "Typing and pausing writes the text to ?search= once (other query params are kept).",
    "Back and Forward move through earlier searches: the box shows the URL's search and nothing re-navigates.",
    "Enter searches immediately and URL-encodes the text (\"fish & chips\" survives).",
    "Clearing the box removes the search parameter.",
  ],
  reproSteps: [
    "Press Run, type \"milk\" and pause: the URL line shows /products?search=milk.",
    "Type over it so the box reads \"eggs\" and pause again: the URL shows search=eggs.",
    "Click Back: the box and the URL briefly show \"milk\" and then jump back to \"eggs\". Click Back twice more: you cannot reach the earlier entries.",
    "Type \"fish & chips\" and press Enter: the URL's search value is cut off at the ampersand.",
  ],
  acceptanceCriteria: [
    "After Back, the box and URL show the previous search and stay there.",
    "Walking Back twice reaches the first history entry.",
    "Enter navigates immediately with a correctly encoded parameter.",
    "Existing query parameters such as category are preserved.",
  ],
  edgeCases: [
    "Back while the debounced value is still the old one",
    "Special characters (&, spaces) in the query",
    "Clearing the box",
    "Another parameter (?category=bakery) already in the URL",
  ],
  hints: [
    "Trace what happens in the two effects at the instant the URL changes because of Back. What is `debouncedText` at that moment?",
    "An effect that depends on the URL value runs when the URL changes. It compares the URL to a debounced value that has not caught up yet and decides the URL is \"wrong\".",
    "The navigation effect should only react to the debounced text changing. Read the latest URL value from a ref instead of listing it as a dependency.",
    "For Enter, build the query string with URLSearchParams instead of concatenating the text.",
  ],
  explanation: {
    rootCause:
      "The navigation effect listed `urlSearch` as a dependency. On Back the URL changes first, while `debouncedText` still holds the previous (newer) search for another debounce interval. The effect runs, sees debouncedText !== urlSearch, and navigates to the stale debounced value, undoing the Back (and pushing a new history entry). Separately, Enter built the URL with string concatenation, so characters like & were not encoded.",
    fix: "Keep the latest URL values in a ref and make the navigation effect depend only on `debouncedText`: it then runs when the user's typing settles, compares against the current URL and navigates only if they differ. After Back the debounced value catches up to the URL and nothing navigates. Build every query string with URLSearchParams (it encodes), and delete the parameter when the text is empty.",
    takeaways: [
      "An effect should run because of the thing it reacts to, not because something it merely reads changed. Refs are the escape hatch for \"latest value\" reads.",
      "Two-way sync (state <-> URL) needs a rule for who wins; echo changes must not be re-sent.",
      "Never build query strings with string concatenation.",
    ],
  },
  expectedFailures: ["Back", "special characters"],
});
