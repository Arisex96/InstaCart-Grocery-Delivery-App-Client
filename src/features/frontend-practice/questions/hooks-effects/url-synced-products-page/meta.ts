import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "url-synced-products-page",
  title: "Build a Products page whose filters live in the URL",
  topic: "hooks-effects",
  difficulty: "hard",
  kind: "build",
  minutes: 55,
  summary: "Category, search, sort and page in ?query params, with loading/error/empty states and pagination.",
  scenario:
    "Shoppers want to share and bookmark a filtered Products page (\"bakery, cheapest first, page 2\") and expect the browser Back button to step through their filter changes. Today the Products page keeps its filters in component state, so none of that works.\n\n" +
    "Build ProductsPage so the URL is the single source of truth: category, search, sort and page are read from the query string, changes write to it, and every change loads the matching products from the API. You also build the small Pagination component it uses. The Demo shows your page with a live URL read-out, and the Target UI tab shows the finished page.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/Navbar.tsx", "client/src/hooks/useDebounce.ts"],
  editableFiles: ["src/pages/ProductsPage.jsx", "src/components/Pagination.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js", "src/hooks/useDebounce.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "ProductsPage props: debounceMs (default 300) and pageSize (default 6). It renders an <h1> \"Products\" and a filter bar with: a search input (type=search) labelled \"Search products\", a <select> labelled \"Category\" (option \"All products\" with value \"all\", then one option per category from the fixture using its slug as the value), and a <select> labelled \"Sort by\" with options Default (value default), \"Price: low to high\" (price-low) and \"Price: high to low\" (price-high).",
    "URL contract: query params `category`, `search`, `sort`, `page`. Default values are omitted from the URL (category=all, empty search, sort=default, page=1). The controls always reflect the URL.",
    "Data: on every change of category/search/sort call api.get(\"/products\", { params: { category, search, sort } }) with exactly those three params (defaults: \"all\", \"\", \"default\"). Pagination is done on the client from the full result.",
    "Loading: <p role=\"status\">Loading products…</p>. Error: an element with role=\"alert\" saying \"Could not load products\" plus a button \"Try again\" that refetches. Empty result: the text \"No products found\". Success: a result count line (\"12 products\" / \"1 product\") and a <ul aria-label=\"Products\"> with one <li> per product on the current page showing its name and price as \"$12.34\".",
    "Pagination component (props: page, totalPages, onPageChange): renders nothing when totalPages <= 1; otherwise a <nav aria-label=\"Pagination\"> with a \"Previous page\" button, the text \"Page X of Y\" and a \"Next page\" button. Previous is disabled on page 1, Next on the last page.",
    "History: changing category, sort or page PUSHES a history entry; typing in the search box (after the debounce) REPLACES the current entry. Changing category, sort or search resets the page to 1 (page is dropped from the URL).",
    "Back/Forward must restore the previous filters: the controls update, the products reload, and the search box shows the URL's search without the page ever re-navigating on its own.",
  ],
  expectedBehavior: [
    "6 products per page; \"Page X of Y\" matches the filtered result, not the whole catalogue.",
    "A page param that is not a positive integer (abc, 0, -2) shows page 1; a page beyond the last shows the last page and the URL is corrected (replace) to it.",
    "A response for older filters never overwrites the results of newer ones.",
  ],
  reproSteps: [
    "Press Run and open the Target UI tab: change the category, sort and page and watch the URL read-out above the page.",
    "Use the Demo links (Bakery, Page 2, Page 99, Page abc) to try the URL-driven states, and the speed buttons (Fast, Slow, Fail next request) to see loading and error states.",
    "In your build, press the browser-like Back link in the Demo after a few changes and check that the filters come back.",
  ],
  acceptanceCriteria: [
    "Filters, sort and page round-trip through the URL; defaults are omitted.",
    "Loading, error (with Try again), empty and success states are all reachable.",
    "Category/sort/page push history, typing replaces it, and every filter change resets the page.",
    "Invalid or out-of-range page params are handled; stale responses are ignored.",
    "Pagination is accessible and hidden when there is a single page.",
  ],
  edgeCases: [
    "?page=abc, ?page=0, ?page=-3, ?page=99",
    "Back after typing: the search box and the request must follow the URL, not re-navigate",
    "A slow response for old filters finishing after the new one",
    "A retry after a failed request",
    "Exactly one page of results (no pagination)",
  ],
  hints: [
    "useSearchParams gives you the URL state. Derive category/search/sort/page from it on every render instead of copying them into useState.",
    "The search box is the one place that needs local state (so typing is instant). Remember the last value you wrote to the URL so that a URL change you did not cause (Back/Forward) updates the box, but your own write does not.",
    "setSearchParams accepts a function, and { replace: true } replaces the entry. A tiny helper that sets or deletes keys keeps every handler to one line.",
    "For the fetch effect use a per-run `ignore` flag in the cleanup, exactly like the search race exercise, and an `attempt` counter in the dependencies to implement Try again.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise, not a bug hunt. The main trap is duplicating URL state in component state, which makes Back/Forward fight your own updates. A second trap is the debounced search: writing it to the URL must not clobber what the user is still typing, and must not push a history entry per keystroke.",
    fix:
      "Treat the URL as the source of truth and derive filters from useSearchParams. Keep only the search text locally, with a ref remembering the last value written to the URL: URL → box when the URL changed externally, debounced box → URL (replace) otherwise. Fetch with an ignore flag in the effect cleanup, derive totalPages and the visible slice during render, and correct an out-of-range page with a replace once the data is loaded.",
    takeaways: [
      "URL state: derive, don't copy. The URL is already a store.",
      "Push for navigation-like changes, replace for continuous input like typing.",
      "Guard async effects with an ignore flag; render states from one status value.",
    ],
  },
  expectedFailures: ["first 6 products", "history entry", "debounce", "latest filters", "try again"],
});
