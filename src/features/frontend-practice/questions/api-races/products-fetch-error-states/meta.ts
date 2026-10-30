import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-fetch-error-states",
  title: "Products page spins forever when the API fails",
  topic: "api-races",
  difficulty: "easy",
  minutes: 20,
  summary: "A failed /products request leaves the loader on screen, and the mapped ids are wrong.",
  scenario:
    "On a flaky mobile connection the Products page sometimes shows \"Loading products…\" forever. There is no error message and no way to try again short of reloading the browser. Separately, QA noticed that adding two different products from the listing only ever puts one line in the cart.\n\n" +
    "ProductListing is the data-loading half of src/pages/Products.tsx: an effect calls api.get(\"/products\", { params }), maps the server payload to the client Product shape and stores it. The fake api in this lab can fail on demand (api.__configure({ failNext: 1 })).",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductCard.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/ProductListing.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js", "src/components/ProductCard.jsx", "src/store/useCartStore.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "While a request is in flight the listing shows \"Loading products…\" (role status).",
    "If the request fails, the loader goes away and \"Couldn't load products. Please try again.\" is shown (role alert) with a Retry button.",
    "Retry requests the products again, clearing the error while it loads.",
    "Every mapped product has a real `_id` (the server calls it `id`), so cart actions target the right product.",
  ],
  reproSteps: [
    "Press Run. The demo makes the first request fail on purpose: the preview stays on \"Loading products…\" and the Console shows \"Failed to load products\".",
    "Pick another category in the demo's dropdown: this time the request succeeds and the cards appear (the Console also warns about missing keys).",
    "Click the + button on two different cards: the \"Cart lines\" counter stays at 1.",
  ],
  acceptanceCriteria: [
    "A failed request always ends the loading state and shows an error message with a Retry button.",
    "Retry (and a category change) fetches again and clears the error.",
    "Products are mapped with `_id` taken from the server `id`.",
    "An empty result shows \"No products found\"; a response arriving after unmount is ignored.",
  ],
  edgeCases: [
    "The request fails, then Retry succeeds",
    "The category changes while the previous request is still pending",
    "The component unmounts before the response arrives",
    "The server returns an empty list",
  ],
  hints: [
    "Follow what happens to `fetching` when the request throws. Which line sets it back to false?",
    "A `finally` block runs on both paths. Remember the `isMounted` guard, though: an unmounted component must not set state.",
    "Compare the field names in the mapping with the payload in src/api/axios.js (look at `serverProducts` in src/data/products.js).",
    "For Retry, an effect re-runs when one of its dependencies changes. What small piece of state could you bump to trigger it?",
  ],
  explanation: {
    rootCause:
      "`setFetching(false)` only ran on the success path, so a thrown request left `fetching` true forever, and the catch block only logged to the console: there was no error state to render. The mapping also read `p._id`, but the server sends `id`, so every client product got `_id: undefined` and different products collided in the cart store.",
    fix: "Move `setFetching(false)` into a `finally` (still behind the isMounted guard), add an `error` state that the catch sets and the next request clears, render an alert with a Retry button that bumps a `reloadKey` dependency, and map `_id: p.id`.",
    takeaways: [
      "Loading flags belong in `finally`, not at the end of the success path.",
      "Every async UI needs four states: loading, error, empty, success.",
      "Map API payloads at the boundary and double-check field names against the real response.",
    ],
  },
  expectedFailures: ["maps the server id", "error message", "loading indicator", "retry"],
});
