import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-pagination",
  title: "Pagination drops the last page and leaves shoppers on an empty one",
  topic: "lists",
  difficulty: "hard",
  minutes: 40,
  summary: "A usePagination hook and its controls: page count, resets, clamping, page-size changes and accessibility.",
  scenario:
    "The Products page is getting pagination. The first draft (usePagination + PaginatedProducts) has several issues QA found within minutes: with 12 products and 5 per page there are only 2 pages, so the last two products can never be reached; searching while on page 3 leaves the shopper on page 3 of the new, much shorter list (an empty screen); changing \"per page\" while on page 2 jumps to a different part of the catalogue; with no matches the footer reads \"Page 1 of 0\"; and the arrow buttons have no accessible names, so screen reader users cannot paginate.\n\n" +
    "Fix the hook and the component. The hook should be reusable, so its rules (page count, resets, clamping) belong in usePagination, while labels and landmarks belong in the component.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/hooks/usePagination.js", "src/components/PaginatedProducts.jsx"],
  shared: ["src/data/products.js", "src/store/useCartStore.js", "src/components/ProductCard.jsx"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "totalPages = ceil(items / pageSize), never below 1: 12 items at 5 per page is 3 pages (5, 5, 2).",
    "Prev/Next never go out of range and are disabled at the ends.",
    "Changing the search (resetKey) returns to page 1.",
    "If the list shrinks, the current page is clamped to the new last page.",
    "Changing the page size keeps the first item that was visible on screen.",
    "Controls live in a navigation landmark named \"Pagination\" with \"Previous page\" / \"Next page\" buttons and a polite live \"Page X of Y\".",
    "No matches: \"No products match your search\" and \"Page 1 of 1\" with both buttons disabled.",
  ],
  reproSteps: [
    "Press Run (4 per page) and switch \"per page\" to 5. The footer says \"Page 1 of 2\", but 12 products at 5 per page need 3 pages. Click Next until it stops: the last two products are never shown.",
    "Go to the last page, then type a search that leaves only a few products: the grid is empty and the footer still shows the old page.",
    "Go to page 2 and switch \"per page\" to 6 or 12: the visible products jump to a different part of the list.",
  ],
  acceptanceCriteria: [
    "All behaviours in \"Expected behavior\" hold.",
    "usePagination stays generic: it knows nothing about products.",
    "Buttons are reachable and named for assistive technology.",
  ],
  edgeCases: [
    "Item count that is an exact multiple of the page size",
    "A list that shrinks while the shopper is on the last page",
    "Zero items",
    "Page size larger than the list",
  ],
  hints: [
    "Start with the numbers: how many pages should 12 items at 5 per page give, and what does `Math.floor` give? What about 0 items?",
    "The current page may become invalid when inputs change (fewer items, bigger page size). Instead of trying to remember to fix it in every handler, can you derive a valid page from the stored one?",
    "Resetting on a change of some key does not need an effect: React allows adjusting state during render when you compare with the previously seen value. To keep the first visible item on a size change, convert the page into an item index and back.",
  ],
  explanation: {
    rootCause:
      "The hook used `Math.floor` for the page count (dropping the partial last page, and returning 0 for an empty list), stored a raw page number that nothing validated, ignored `resetKey`, and changed the page size without recomputing the page. The component's icon-only buttons had no accessible names and no navigation landmark.",
    fix: "Use `Math.max(1, Math.ceil(items / pageSize))`, derive `currentPage = Math.min(page, totalPages)`, reset the page when `resetKey` changes (render-time state adjustment), and on a size change compute the first visible item index and convert it to the new page. In the component, wrap the controls in `<nav aria-label=\"Pagination\">`, name the buttons, announce \"Page X of Y\" politely, and show an empty message.",
    takeaways: [
      "Derive valid values from raw state instead of patching every handler.",
      "Page and index are two views of the same position: convert, don't copy.",
      "Icon-only controls need accessible names; groups of controls need a landmark.",
    ],
  },
  expectedFailures: ["page count", "last partial page", "search changes", "list shrinks", "page size", "accessible", "nothing matches"],
});
