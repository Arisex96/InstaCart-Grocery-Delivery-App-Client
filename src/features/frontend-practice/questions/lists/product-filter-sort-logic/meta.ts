import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "product-filter-sort-logic",
  title: "Filters hide everything, crash on search and sort prices as text",
  topic: "lists",
  difficulty: "medium",
  minutes: 30,
  summary: "The filter + sort pipeline behind the Products grid has six realistic bugs.",
  scenario:
    "After the team extracted the useMemo pipeline from ProductGrid into src/lib/filterProducts.js, QA filed several reports: clearing the min-price box makes every product disappear; searching for something that matches no product name crashes the page whenever the catalogue contains a product without a description; \"Price: Low to High\" puts $11.99 before $2.00; products priced exactly at a bound are excluded; the \"Featured\" row with a limit of 3 does not show the three cheapest products; and sorting somehow reorders the catalogue that other components read.\n\n" +
    "Fix filterProducts so it behaves like the real ProductGrid pipeline. The preview renders a grid driven by the function, with the same controls as the Products page.",
  inspiredBy: ["client/src/components/ProductGrid.tsx", "client/src/pages/Products.tsx"],
  editableFiles: ["src/lib/filterProducts.js"],
  shared: ["src/data/products.js", "src/store/useCartStore.js", "src/components/ProductCard.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "category \"all\" (or none) keeps every category; otherwise it matches case-insensitively.",
    "searchQuery matches name or description, case-insensitively and trimmed; a missing description never throws.",
    "minPrice / maxPrice are inclusive; null, undefined and NaN (an empty number input) mean \"no bound\".",
    "sortBy: price-low-to-high / price-high-to-low (numeric), rating, discount (descending), name-asc.",
    "limit is applied after filtering and sorting.",
    "The products array passed in is never modified.",
  ],
  reproSteps: [
    "Press Run. The grid is empty even though no filter is set: the min-price box is empty, which the page turns into NaN.",
    "Type 1 in the min-price box, then pick \"Price: Low to High\": the order is 1.2, 11.99, 2, 2.25… (text order).",
    "Search for \"zzz\": the preview throws. Check the Console tab and the line at the bottom of the preview: \"Catalogue starts with\" changes after sorting.",
  ],
  acceptanceCriteria: [
    "All behaviours in \"Expected behavior\" hold for every combination of filters.",
    "filterProducts is pure: same input, same output, input untouched.",
    "No filter combination throws.",
  ],
  edgeCases: [
    "minPrice or maxPrice is NaN (parseFloat(\"\"))",
    "A product whose description is null",
    "Price exactly equal to a bound",
    "limit combined with sorting",
    "Uppercase category or search text",
  ],
  hints: [
    "Run `filterProducts(products)` in your head with no options: which variable holds the list, and is it a copy?",
    "`NaN` is not `null` and not `undefined`, and every comparison with NaN is false. What does `p.price > NaN` do to each product?",
    "Array.prototype.sort sorts in place, and comparing strings is not comparing numbers. In which order should the pipeline's steps run so that `limit` returns the right items?",
  ],
  explanation: {
    rootCause:
      "Several independent pipeline bugs: the list started as the caller's own array (so sort() mutated the catalogue); an empty price input became NaN and every `>`/`<` comparison with NaN is false; `description.toLowerCase()` threw for null descriptions; bounds used strict comparisons; prices were compared as strings (\"11.99\" < \"2\"); and `limit` was applied before sorting.",
    fix: "Start from a copy (`[...products]`), skip bounds that are null/undefined/NaN and make them inclusive, read the description with `?? \"\"`, compare category case-insensitively, sort numerically (`a.price - b.price`), and slice for `limit` as the last step.",
    takeaways: [
      "Treat props and shared arrays as read-only: copy before sort().",
      "Validate numeric inputs: NaN silently breaks every comparison.",
      "Pipelines are order-sensitive: filter, then sort, then limit.",
    ],
  },
  expectedFailures: ["case-insensitively", "null description", "inclusive", "NaN", "numerically", "after sorting", "mutate"],
});
