import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-listing-page",
  title: "Build the Products listing with every UI state",
  topic: "ui-states",
  difficulty: "medium",
  kind: "build",
  minutes: 40,
  summary: "Load products from the API and render loading, error, empty and success states plus a category filter.",
  scenario:
    "The Products page needs a listing section that loads its data from the API and always shows the right state: skeleton cards while loading, an error with a way to retry, an empty state with a way out, and the product grid when everything worked.\n\n" +
    "Implement ProductsListing in src/components/ProductsListing.jsx. It calls api.get(\"/products\", { params: { category } }) and receives { data: { products } } where each product has an `id` (not `_id`). The Demo has buttons that make the fake server fast, slow, failing or empty, and the Target UI tab shows the finished design.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx"],
  editableFiles: ["src/components/ProductsListing.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "An <h2> \"Products\" and a labelled <select> (label text \"Category\") with an option \"All products\" (value \"all\") followed by one option per entry of `categories` from src/data/products.js (value = slug, text = name).",
    "Loading: an element with role=\"status\" and accessible name \"Loading products\" containing 8 skeleton placeholders (animate-pulse cards, hidden from assistive tech). Nothing else (no empty state) is shown while loading.",
    "Error: an element with role=\"alert\" containing the text \"Could not load products\" and a button named \"Retry\" that requests the same category again and shows the loading state.",
    "Empty: the text \"No products found\" and a button named \"Clear filters\" that sets the category back to \"all\" (and reloads).",
    "Success: a line \"Showing N products\" (\"Showing 1 product\" for one) and a <ul> grid with one <li> per product: name in an <h3>, price like \"$3.50\", the original price in a <del> only when discount > 0 and it is higher than the price, a \"<n>% OFF\" badge for discounted products and an \"Out of stock\" badge when stock is 0.",
  ],
  expectedBehavior: [
    "On mount it requests category \"all\" (or the `initialCategory` prop); changing the select requests the new category and shows the loading state again.",
    "If the category changes while a request is in flight, only the response for the latest category is ever shown.",
    "A failed request shows the error state; Retry fires a new request.",
  ],
  reproSteps: [
    "Press Run and look at the Demo: the listing is only a stub.",
    "Open the Target UI tab to see the finished listing, then use the Demo buttons (Normal, Slow, Failing, Empty) to see each state.",
    "Build it state by state: loading first, then success, then error and empty.",
  ],
  acceptanceCriteria: [
    "Loading, error, empty and success states each render exactly as specified and never overlap.",
    "The select refetches with the chosen category; Retry and Clear filters trigger a new request.",
    "Out-of-order responses never overwrite newer data.",
    "Products are mapped from the server shape (id) and shown with the right price, original price and badges.",
  ],
  edgeCases: [
    "Empty result must not flash while the first request is still loading",
    "A discounted product whose originalPrice equals price shows no strike-through",
    "Singular vs plural count",
    "Switching categories twice quickly",
  ],
  hints: [
    "Model the data as one status value (\"loading\" | \"error\" | \"success\") plus the products, instead of separate booleans that can disagree.",
    "Put the request in an effect that depends on the category (and a retry counter). Give each run an `ignore` flag that its cleanup flips so stale responses are dropped.",
    "Compute the empty state from status === \"success\" && products.length === 0, so it cannot appear while loading.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise, so there is no bug. The main trap is state that can contradict itself (loading false + empty true before the first response) and responses that arrive out of order.",
    fix: "Keep a single status + products state, fetch inside an effect keyed on [category, attempt] with an ignore flag in the cleanup, and derive each UI state from status. Retry/Clear filters only change category/attempt and let the same effect do the work.",
    takeaways: [
      "One status value beats several booleans.",
      "Every async effect needs a way to ignore stale results.",
      "Design every state (loading, error, empty, success) before styling the happy path.",
    ],
  },
  expectedFailures: ["loading", "Retry", "No products found", "category"],
});
