import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-fetch-filters-loop",
  title: "Products page hammers the API with requests nonstop",
  topic: "hooks-effects",
  difficulty: "medium",
  minutes: 20,
  summary: "A fetch effect depends on a filters object created on every render, so it re-runs after every response.",
  scenario:
    "The backend team paged us: the products endpoint is getting hundreds of identical requests per minute from a single browser tab on the Products page. The list itself looks fine, but the network tab shows a request every time the previous one finishes, forever. The loading text also flickers.\n\n" +
    "ProductListing follows the same pattern as the real Products page (src/pages/Products.tsx): the filters become `params` for api.get(\"/products\"), and an effect fetches them with an isMounted guard. A teammate \"fixed\" a lint warning about missing dependencies shortly before the problem started.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/api/axios.ts"],
  editableFiles: ["src/components/ProductListing.jsx"],
  shared: ["src/api/axios.js", "src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "One request is sent for the initial filters, and no more while nothing changes.",
    "Changing the category or the max price sends exactly one new request.",
    "Re-rendering the component with the same filters does not send a request.",
    "Responses that arrive after the filters changed never replace the newer list.",
  ],
  reproSteps: [
    "Press Run and watch \"API requests so far\" in the preview: it keeps climbing although you are not touching anything.",
    "Change the category in the select: the counter jumps and still never stops growing.",
    "Open the Console tab: every response triggers another request (the fake api logs nothing, so use the counter).",
  ],
  acceptanceCriteria: [
    "After the first response the request counter stays still.",
    "A filter change causes exactly one extra request carrying the new params.",
    "Params are still { category, minPrice, maxPrice, sort } like the Products page sends.",
    "The isMounted guard keeps working for out-of-order responses.",
  ],
  edgeCases: [
    "Parent re-renders with identical props",
    "Filters change while a request is still in flight",
    "maxPrice is an empty string",
  ],
  hints: [
    "Count how many times the effect runs, not how many times you expect it to. What does React compare in the dependency array?",
    "`const filters = { ... }` is a brand-new object on every render, and every response calls setState, which renders again.",
    "Depend on the primitive values the object is made from, and build the params object inside the effect.",
  ],
  explanation: {
    rootCause:
      "The dependency array contained `filters`, an object literal created during render. React compares dependencies with Object.is, so a new object on every render means the effect runs after every render. The effect fetches, the response calls setProducts/setLoading, that re-renders, creating another filters object, and the cycle repeats forever.",
    fix: "List the primitive inputs (`category`, `maxPrice`) in the dependency array and build the params object inside the effect. The effect then re-runs only when a filter really changes.",
    takeaways: [
      "Objects, arrays and functions created in render are new on every render: never use them as dependencies unless memoized.",
      "Prefer primitive dependencies; build derived objects inside the effect.",
      "A setState inside an effect combined with a changing dependency is a classic infinite-loop recipe.",
    ],
  },
  expectedFailures: ["exactly once for the initial", "stops requesting"],
});
