import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-detail-abort",
  title: "Product page shows the wrong product and cancel errors",
  topic: "api-races",
  difficulty: "easy",
  minutes: 20,
  summary: "Switching products quickly shows the previous product, and nothing ever aborts the old request.",
  scenario:
    "On the product page (client/src/pages/ProductPage.tsx) shoppers jump between products from the \"You may also like\" row. On slow connections the page sometimes ends up showing the product they left a moment ago, under the new product's URL. Our monitoring also shows requests for products nobody is looking at any more, completed long after the shopper navigated away.\n\n" +
    "ProductDetail is a trimmed copy of that page's loading logic. The fake api in this lab understands AbortSignal (it rejects with a CanceledError when the signal aborts), just like axios does. Make the component cancel work it no longer needs, and make sure a cancellation is never reported to the shopper as a failure.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/ProductDetail.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The page always shows the product for the current productId, whatever order the responses arrive in.",
    "Changing productId or unmounting aborts the request that is still in flight (an AbortSignal is passed to api.get).",
    "An aborted (canceled) request never shows \"Could not load product\"; a real failure still does.",
    "Loading is shown for the latest request only.",
  ],
  reproSteps: [
    "Press Run. The demo makes \"Organic Bananas\" slow (about 1.2 s) and the others fast.",
    "Click \"Organic Bananas\" and immediately click \"Whole Milk\". Milk appears quickly.",
    "Wait a second: the slow bananas response lands last and replaces the milk page, while the button for Milk is still highlighted.",
    "Open the Console tab and look at the demo's request log: no request was ever aborted.",
  ],
  acceptanceCriteria: [
    "api.get receives { signal } and the signal is aborted when productId changes or the component unmounts.",
    "A late response for an old productId never changes what is on screen.",
    "A canceled request produces no error message; a real 500 still shows \"Could not load product\".",
    "After the latest request settles, loading is false.",
  ],
  edgeCases: [
    "The old request fails with a CanceledError after the new one succeeded",
    "The component unmounts while a request is pending",
    "The same product is requested again after a failure",
  ],
  hints: [
    "Each effect run starts a request. What tells an older run that its answer is no longer wanted?",
    "AbortController gives you a signal to pass to api.get and an abort() to call from the effect cleanup.",
    "An aborted request rejects. Check the error (name CanceledError, or signal.aborted) before turning it into UI, and guard the finally block too.",
  ],
  explanation: {
    rootCause:
      "The effect started a request per productId but never cancelled or ignored the previous one. Responses can arrive in any order, so a slow answer for an old product overwrote the newer one, and the catch block would have reported any cancellation as a failure.",
    fix: "Create an AbortController per effect run, pass its signal to api.get and abort it in the cleanup. In the async function, bail out when the error is a cancellation (or the signal is aborted) and only update state (including loading) for the run that is still current.",
    takeaways: [
      "Cleanup is the place to cancel work started by an effect.",
      "Cancelled requests reject: treat that as control flow, not as an error state.",
      "Guard every state update after an await, including finally.",
    ],
  },
  expectedFailures: ["abort signal", "aborts the in-flight request", "latest product", "canceled request"],
});
