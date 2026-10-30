import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "filter-sidebar-panel",
  title: "Build the products filter sidebar and result list",
  topic: "lists",
  difficulty: "medium",
  kind: "build",
  minutes: 40,
  summary: "Category, price range and sort controls that filter a product list with a live count.",
  scenario:
    "The Products page needs its filter sidebar rebuilt as one self-contained component. Shoppers pick a category, optionally set a price range, choose a sort order and immediately see the matching products and how many there are.\n\n" +
    "Implement ProductBrowser in src/components/ProductBrowser.jsx. It receives `products` and `categories` as props (see src/data/products.js) and renders both the sidebar and the result list. Use the Demo to switch between catalogues and the Target UI tab to see the finished design.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx"],
  editableFiles: ["src/components/ProductBrowser.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "An <aside aria-label=\"Filters\"> next to the results, containing a <fieldset> with legend \"Category\": radio inputs labelled \"All products\" (selected by default) and one per category name (\"Bakery\", \"Dairy & Eggs\", …).",
    "Two number inputs labelled \"Min price\" and \"Max price\" (empty by default; empty means no limit; both bounds are inclusive). If min is greater than max, show an element with role=\"alert\" saying \"Min price must be at most max price\" and apply no price filter until it is fixed.",
    "A <select> labelled \"Sort by\" with the options \"Default\", \"Price: Low to High\", \"Price: High to Low\", \"Highest rated\" and \"Biggest discount\". Default keeps the original order; ties keep the original relative order.",
    "A status line (role=\"status\") with the live result count: \"12 products\" (\"1 product\" for exactly one).",
    "A \"Clear filters\" button that is disabled when nothing is active (category All, no prices, Default sort) and otherwise resets everything.",
    "Results in a <ul aria-label=\"Products\">: one <li> per product with its name and price (\"$3.50\"). With no matches show \"No products match your filters\" instead of the list. The `products` prop must never be mutated (it may be frozen).",
  ],
  expectedBehavior: [
    "Category, price range and sort combine: the count and the list always show products matching all active filters in the chosen order.",
    "Clearing a price input removes that limit instead of treating it as 0.",
    "Rendering never changes the array passed in as `products`.",
  ],
  reproSteps: [
    "Press Run: the skeleton lists every product but has no controls.",
    "Open the Target UI tab, pick Bakery, then set Max price to 4 and sort by Price: High to Low.",
    "Switch the Demo to \"Empty catalogue\" and \"Five products\" to check the other states.",
  ],
  acceptanceCriteria: [
    "Radios, price inputs and the sort select are labelled exactly as specified and filter/sort the list.",
    "Price bounds are inclusive and an empty input means no bound; min > max shows the alert and filters nothing by price.",
    "The count is correct and pluralised; Clear filters is disabled when pristine and resets everything otherwise.",
    "No-results message appears when nothing matches; the input array is not mutated.",
  ],
  edgeCases: [
    "a product priced exactly at the min or max",
    "min > max",
    "a category with no products in the current catalogue",
    "a frozen `products` array (sorting in place would throw)",
    "ties in rating keep the original order",
  ],
  hints: [
    "Keep the four controls in state (category, min, max, sort) and derive the list during render, with useMemo if you like; the visible list is not state.",
    "Copy before sorting (`[...list].sort(...)`): `Array.prototype.sort` mutates and the products prop may be frozen. Numeric inputs give strings, so only convert non-empty ones with Number().",
    "A small `isActive` boolean (category !== 'all' || min !== '' || max !== '' || sort !== 'default') drives the disabled state of Clear filters; a `compare` map keyed by the sort value keeps the sorting code tidy.",
  ],
  explanation: {
    rootCause:
      "There is no bug: this is a build exercise. The main traps are sorting the prop array in place, treating an empty price input as 0, and storing the filtered list in state instead of deriving it.",
    fix: "Store only the control values; compute `visible` by filtering a copy of `products` (category, inclusive min/max when non-empty and valid) and sorting that copy with a comparator chosen by the sort key. Render the count and list from `visible`.",
    takeaways: [
      "Store the minimum state and derive the rest.",
      "Never mutate props: copy before sort().",
      "Treat empty inputs as 'no value' rather than 0, and keep bounds inclusive.",
    ],
  },
  expectedFailures: ["category", "price", "sort", "count", "clear"],
});
