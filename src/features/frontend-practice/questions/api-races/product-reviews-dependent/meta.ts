import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-reviews-dependent",
  title: "Reviews of the previous product show up, and one failure blanks the page",
  topic: "api-races",
  difficulty: "medium",
  minutes: 30,
  summary: "Product and reviews are loaded in a waterfall with no stale guard; a failing reviews call kills the whole page.",
  scenario:
    "The product page loads the product and then its reviews (client/src/pages/ProductPage.tsx keeps both in state). Two tickets came in. First: after clicking from one product to another, the new product sometimes shows the reviews of the old one (\"5 stars, great bananas\" under the milk). Second: when the reviews service is down, the whole page turns into \"Could not load product\" even though the product itself loaded fine.\n\n" +
    "ProductDetails is a trimmed copy of that flow. Product details come from api.get(\"/products/:id\"); reviews come from reviewsApi.list(productId) (a read-only module that stands in for the reviews endpoint). The two requests do not depend on each other, so they should not wait for each other either.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/ProductDetails.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The product and its reviews are requested at the same time.",
    "Only data for the current productId is ever shown, even if an old request finishes last.",
    "If only the reviews fail, the product is still shown, with \"Reviews are unavailable\" where the reviews would be.",
    "If the product fails, the page shows \"Could not load product\".",
    "No reviews → \"No reviews yet\".",
  ],
  reproSteps: [
    "Press Run. In the demo the Bananas reviews are slow (about 1.2 s) and the Avocado reviews always fail.",
    "Click \"Organic Bananas\", then right away click \"Whole Milk\". Wait about a second: bananas reviews appear under Whole Milk.",
    "Click \"Hass Avocados\": the whole page shows \"Could not load product\" although the avocado product exists.",
    "Open the Console tab: the product request and the reviews request are made one after the other.",
  ],
  acceptanceCriteria: [
    "api.get and reviewsApi.list are both called before either has resolved.",
    "A response for an old productId never changes what is on screen (product or reviews).",
    "A reviews failure does not hide the product; a product failure shows the page error.",
    "Loading states end when the latest requests have settled.",
  ],
  edgeCases: [
    "The old product's reviews arrive after the new product has loaded",
    "The reviews request fails while the product request is still pending",
    "Both requests fail",
    "A product with zero reviews",
  ],
  hints: [
    "Look at where the second await sits. Does the reviews request really need the product response?",
    "Two independent requests can be started together; Promise.allSettled lets you handle each outcome separately.",
    "The effect cleanup can flip a local flag so a run that is no longer current ignores everything it receives, both product and reviews.",
  ],
  explanation: {
    rootCause:
      "The loader awaited the product, then the reviews, inside one try/catch with no guard for outdated runs. A slow reviews response for the previous product could land after the new product loaded and overwrite its reviews, and a rejection of the reviews call jumped to the shared catch, which replaced the whole page with the product error.",
    fix: "Start both requests together and settle them independently (Promise.allSettled). Track each outcome in its own state (product/error and reviews/reviewsError) and ignore every result in a run whose cleanup has already marked it stale.",
    takeaways: [
      "Independent requests should not form a waterfall.",
      "Promise.all rejects on the first failure; allSettled keeps partial results.",
      "One stale flag per effect run must guard every piece of state the run can set.",
    ],
  },
  expectedFailures: ["at the same time", "reviews fail", "old product", "previous product"],
});
