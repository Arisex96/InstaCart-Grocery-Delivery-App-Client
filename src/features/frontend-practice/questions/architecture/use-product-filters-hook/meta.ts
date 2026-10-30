import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "use-product-filters-hook",
  title: "Extracted useProductFilters hook ignores the URL and breaks Back",
  topic: "architecture",
  difficulty: "hard",
  minutes: 40,
  summary: "A hook extracted from the Products page copies the URL into state: Back/links are ignored, filters drop each other, and results are mutated.",
  scenario:
    "The Products page (client/src/pages/Products.tsx) keeps category, search and sort in the URL so filtered views can be shared and the Back button works. A teammate extracted that logic into a reusable useProductFilters hook, but in review QA found regressions: the Back button and links like /products?category=snacks do not change the list, picking a category wipes the search term from the URL, an empty minPrice param counts as an active filter, and sorting reorders the products array that the page passed in.\n\n" +
    "Fix the hook so that the URL is the single source of truth and the derived list is computed without side effects. ProductsPage (the consumer) and the demo are read-only: the hook's public API must stay exactly as it is.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx"],
  editableFiles: ["src/hooks/useProductFilters.js"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "category, search, sortBy, minPrice and maxPrice are read from the URL on every render (defaults: \"all\", \"\", \"default\", null, null).",
    "Setters update only their own param and keep the others; \"all\"/empty values remove the param.",
    "External navigation (Back, links) changes the filters and the list.",
    "filtered is a new array (the input is never mutated) and keeps its identity while nothing relevant changed.",
    "hasActiveFilters is true only when at least one real filter is set; reset() clears every filter param.",
  ],
  reproSteps: [
    "Press Run and pick the \"Bakery\" category. Type \"bread\" in the search box.",
    "Pick \"Snacks\": the \"bread\" search disappears from the URL line shown above the list.",
    "Click \"Simulate Back\" (or \"Go to Beverages\"): the URL line changes but the list and the highlighted category do not.",
    "Look at the \"Reset\" button on a fresh page: it is enabled although no filter is set.",
  ],
  acceptanceCriteria: [
    "No useState copies of URL values: the filters are derived from useSearchParams.",
    "setCategory/setSearch/setSortBy/setPriceRange merge into the existing params.",
    "An empty or invalid minPrice/maxPrice param means null (no filter); the range is inclusive on both ends.",
    "A search term never crashes on a product whose description is null.",
    "products is never mutated; sorting uses a copy.",
    "filtered keeps the same identity across re-renders with unchanged inputs (useMemo).",
    "reset() removes category, search, sortBy, minPrice and maxPrice from the URL.",
  ],
  edgeCases: [
    "A product with a null description while searching",
    "?minPrice= (present but empty) and ?maxPrice=abc",
    "Choosing the \"all\" category when other params exist",
    "Changing the URL externally while the component stays mounted",
  ],
  hints: [
    "Where does the truth live: in the URL, or in a copy made when the hook first ran? Which of the two changes when the Back button is pressed?",
    "setSearchParams accepts a function of the previous params, so a setter can change one key and leave the rest alone.",
    "Number(null) is 0 and Number(\"\") is 0. Decide explicitly what \"no value\" means before converting.",
    "Array.prototype.sort sorts in place. When no filter is active, filter() is skipped and the sort runs directly on the prop.",
  ],
  explanation: {
    rootCause:
      "The hook seeded useState from the URL once and then kept its own copy, so later URL changes were never seen. Setters replaced the whole query string with a single key, minPrice was parsed with Number(), turning a missing value into 0, and the list was sorted in place on the incoming array (when no filter produced a copy), mutating props and returning a fresh array every render.",
    fix: "Derive every filter from useSearchParams (memoised on the query string), write through setSearchParams with a functional update that sets or deletes only one key, parse prices explicitly (empty or NaN => null), and compute filtered with useMemo from a copy of the products.",
    takeaways: [
      "If state can be derived from the URL, derive it; do not copy it.",
      "Functional setSearchParams preserves unrelated params.",
      "Never sort a prop in place; copy first and memoise the result.",
    ],
  },
  expectedFailures: ["external navigation", "keeps the other params", "empty or invalid price", "mutate", "identity", "reset"],
});
