import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "search-stale-results",
  title: "Search shows results for an older query",
  topic: "api-races",
  difficulty: "medium",
  minutes: 25,
  summary: "A slow earlier request finishes last and overwrites the results of the newer search.",
  scenario:
    "Support tickets say that searching for \"banana\" sometimes shows the results for \"ba\" (including Basmati Rice and chocolate bars), and that the spinner disappears while the final search is still loading. It only happens on slow connections, which is why nobody on the team has seen it.\n\n" +
    "ProductSearch follows the same pattern as the Products page: a debounced query, an effect that calls api.get(\"/products\", { params }), and loading/error state. The fake api in this lab lets you slow down individual queries so you can reproduce the problem on purpose.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/hooks/useDebounce.ts", "client/src/api/axios.ts"],
  editableFiles: ["src/components/ProductSearch.jsx"],
  shared: ["src/api/axios.js", "src/hooks/useDebounce.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The list always reflects the latest query, no matter in which order the responses arrive.",
    "\"Searching…\" stays visible until the response for the latest query has been handled.",
    "Clearing the input empties the list immediately; a response that arrives afterwards must not bring it back.",
    "A failed request shows an error message; the next successful search clears it.",
  ],
  reproSteps: [
    "Press Run. In the preview, type \"ba\" and wait about half a second (that request is deliberately slow).",
    "Immediately keep typing so the box reads \"banana\". The fast \"banana\" request finishes first.",
    "Wait for the slow \"ba\" request to finish: the list flips back to results for \"ba\" while the box still says \"banana\".",
  ],
  acceptanceCriteria: [
    "Results always match the text currently in the box once all requests have settled.",
    "Out-of-order responses never overwrite newer data (no \"flash\" of stale products).",
    "The loading indicator is tied to the latest request only.",
    "Emptying the input clears results and loading, even with a request still in flight.",
  ],
  edgeCases: [
    "A newer request finishes before an older one",
    "An older request finishes while a newer one is still pending",
    "The query is cleared while a request is in flight",
    "A stale request fails after a newer one succeeded",
  ],
  hints: [
    "Each effect run starts its own request. Does anything tell an old run that it is no longer the current one?",
    "The effect's cleanup function runs before the next effect run and on unmount. A variable captured by the closure can record \"this run is outdated\".",
    "Check every place that calls a setState after an await — including the `finally` block and the catch — not just the success path.",
  ],
  explanation: {
    rootCause:
      "Every effect run fires its own request, but nothing invalidates older runs. When an older (slower) request resolves after a newer one, its `.then` still calls `setProducts` and `setLoading(false)`, overwriting newer state. Network responses can arrive in any order.",
    fix: "Give each effect run a local `ignore` flag that the cleanup function flips to true. After every await, only touch state if the run is still current (success, error and finally). Also reset results and loading synchronously when the query becomes empty, so an in-flight request cannot repopulate the list.",
    takeaways: [
      "Async work started in an effect needs a way to be cancelled or ignored in its cleanup.",
      "Guard every state update after an await, including finally.",
      "An AbortController is the other option: it cancels the request itself, but you still handle the resulting error.",
    ],
  },
  expectedFailures: ["latest query", "loading indicator", "emptied"],
});
