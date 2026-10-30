import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-load-more",
  title: "\"Load more\" duplicates products, mixes categories and never ends",
  topic: "lists",
  difficulty: "hard",
  minutes: 35,
  summary: "Paged product list: fast clicks, category switches mid-request, end of results and retry.",
  scenario:
    "The Products page is moving from \"everything at once\" to \"Load more\". Within a day of the beta, support has a list of complaints: impatient shoppers who click twice see the same four products twice (and React complains about duplicate keys); switching category while a page is loading leaves products from the old category in the new list; the button never goes away, so the last click fetches an empty page; and when the network drops the button silently does nothing.\n\n" +
    "LoadMoreProducts calls api.get(\"/products\", { params: { category, page, limit } }) and expects { data: { products, hasMore } }. The preview slows the API down (700 ms) and paginates the fixture so every problem is easy to reproduce.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/LoadMoreProducts.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "On mount (and whenever `category` changes) the list resets and page 1 is requested.",
    "\"Load more\" requests the next page and appends it. While a page is in flight the button is disabled and extra clicks send nothing.",
    "When the server says hasMore is false the button is replaced by \"No more products\".",
    "A response for a previous category (or a previous reset) is ignored, never appended.",
    "A failed request shows \"Could not load more products.\" with a Retry button that asks for the same page again.",
  ],
  reproSteps: [
    "Press Run and wait for the first four products. Double-click \"Load more\" quickly: some products appear twice.",
    "Click \"Load more\", then immediately pick another category: products of the old category show up in the new list.",
    "Keep loading until the fixture is exhausted: the button stays and the last click loads nothing. In the Console tab, see the requests that were sent.",
  ],
  acceptanceCriteria: [
    "No product is ever rendered twice, and each page is requested at most once.",
    "Changing the category resets items, page counter, error and \"end reached\" state.",
    "Late responses from an outdated category are discarded.",
    "Every outcome of a request (success, last page, failure) leaves the UI in a usable state.",
  ],
  edgeCases: [
    "Two clicks within the same render, before loading state is visible",
    "The old category's page 1 resolves after the new category's page 1",
    "hasMore false on the very first page",
    "Retry after a failure on page 2 (must request page 2, not page 3)",
  ],
  hints: [
    "Where does the page number the second click uses come from? Is it already updated when that click happens?",
    "State only updates on the next render. Information that must change right now (is a request running? which page is next?) belongs in a ref.",
    "Give each reset a generation number (a ref you increment in the category effect). After every await, drop the result if its generation is no longer the current one — in the catch and in the finally as well.",
  ],
  explanation: {
    rootCause:
      "loadMore read `page` and `loading` from the render it was created in, so two quick clicks both saw page 2 and both appended it. Nothing tied a response to the category it was requested for, so slow responses landed in a list that had since been reset (the effect also ran only once, so the category change never reset anything). The `hasMore` flag was never shown and failures were swallowed.",
    fix: "Keep the in-flight flag, the next page number and a generation counter in refs. The category effect bumps the generation, clears state and loads page 1; loadMore returns early when a request is running, requests nextPage, discards results from older generations, appends (skipping ids it already has), advances the page only on success, shows the end-of-list message when hasMore is false, and surfaces failures with a Retry that repeats the same page.",
    takeaways: [
      "Anything an event handler must see immediately (in-flight, next page) is not React state.",
      "Tag async work with the context it was started in and discard it when that context is gone.",
      "Advance a cursor only after the page it points to has actually arrived.",
    ],
  },
  expectedFailures: ["only once", "resets", "outdated", "No more products", "Retry"],
});
