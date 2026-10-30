import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-fetch-states",
  title: "Products page flashes \"No products\" and never shows an error",
  topic: "ui-states",
  difficulty: "medium",
  minutes: 25,
  summary: "A data-driven page that mixes loading, error, empty and success into one blank-or-grid view.",
  scenario:
    "On slow connections the Products page opens with a \"No products found\" message that turns into the grid a second later, and when the API fails the shopper sees the same \"No products found\" message forever: there is no error and no way to retry except reloading the whole page. Switching category keeps showing the previous category's products until the new ones arrive, which looks like the filter did nothing.\n\n" +
    "This page is modelled on the fetch effect in src/pages/Products.tsx. Give each state its own, clearly different UI: loading, error (with a Retry button), empty, and success.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/pages/ProductsPage.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js", "src/store/useCartStore.js", "src/components/ProductCard.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "While a request is pending: a \"Loading products…\" status and nothing else (no empty message, no stale list).",
    "On failure: an alert \"We couldn't load products.\" with a Retry button. Retry sends the same request again and shows the loading state.",
    "On an empty successful response: \"No products found\".",
    "On success: the product cards.",
    "Changing the category starts a new loading state and hides the previous category's list.",
  ],
  reproSteps: [
    "Press Run. The demo's first request is slow (about 1.2 s) and then fails once.",
    "During the wait the page shows \"No products found\" instead of a loading state.",
    "After the failure it still says \"No products found\" and there is no Retry. Pick another category to trigger a successful load, then switch back and watch the old list linger while the next request runs.",
  ],
  acceptanceCriteria: [
    "Exactly one of loading / error / empty / success is rendered at a time.",
    "The error state has role=\"alert\" and a Retry button that refetches.",
    "The empty message never appears while a request is pending or after a failure.",
    "A response that belongs to a previous category is ignored.",
  ],
  edgeCases: [
    "Failure followed by a successful Retry",
    "Category changes while a request is in flight",
    "A successful response with zero products",
  ],
  hints: [
    "Count the states the UI can be in. How many pieces of state do you currently have to tell them apart?",
    "A single `status` value (\"loading\" | \"error\" | \"success\") is easier to keep consistent than several booleans.",
    "To retry, the effect must run again with unchanged inputs. Something in its dependency list has to change.",
  ],
  explanation: {
    rootCause:
      "The component only tracked `products` and a `loading` flag that was never set to true, and swallowed errors in `catch`. With no status to render, the \"empty list\" branch doubled as the loading, error and \"nothing yet\" UI, and category changes never reset the old list.",
    fix: "Track a single `status` (loading / error / success) plus the data. Set loading (and clear the list) whenever the request starts, set error in `catch`, and render one branch per state. Add an `attempt` counter to the effect's dependencies so Retry reruns the request; keep the `isMounted`/ignore guard so stale responses are dropped.",
    takeaways: [
      "Model mutually exclusive UI states as one status value, not independent booleans.",
      "Never reuse the empty state as the loading or error state.",
      "A retry button is just a state change that re-triggers the effect.",
    ],
  },
  expectedFailures: ["loading state while", "No products found while", "error with a Retry", "Retry requests again", "category changes"],
});
