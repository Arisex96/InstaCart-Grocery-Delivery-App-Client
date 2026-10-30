import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "admin-products-table",
  title: "Build the admin products table",
  topic: "lists",
  difficulty: "hard",
  kind: "build",
  minutes: 60,
  summary: "A sortable, searchable, paginated table with row selection, a bulk action and inline stock editing.",
  scenario:
    "Store managers manage hundreds of products from the admin dashboard and the current list is a wall of cards. They asked for a real table: sort by name, price or stock, search by name, spot low stock quickly, edit a stock number in place and mark several products out of stock at once.\n\n" +
    "Implement the pure helpers in src/lib/tableUtils.js, the editable stock cell in StockCell.jsx and the table in AdminProductsTable.jsx. The Demo keeps the products in state like the admin page does and logs every callback to the Console; the Target UI tab shows the finished table.",
  inspiredBy: ["client/src/pages/admin/AdminProducts.tsx", "client/src/components/ProductGrid.tsx"],
  editableFiles: [
    "src/components/AdminProductsTable.jsx",
    "src/components/StockCell.jsx",
    "src/lib/tableUtils.js",
  ],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A real table: <table aria-label=\"Products\"> with column headers (<th scope=\"col\">) in this order: a selection column, Name, Category, Price, Stock. Price is shown as \"$3.50\"; Category shows the category's display name (use `categories` from src/data/products.js).",
    "Sortable columns are Name, Price and Stock. Each header contains a <button> whose accessible name is exactly the column label, and its <th> carries aria-sort=\"none\" | \"ascending\" | \"descending\". Clicking cycles none → ascending → descending → none; clicking another column starts it at ascending. Sorting applies to ALL products (not just the visible page), Name uses localeCompare, Price and Stock sort numerically, \"none\" restores the original order. Category is not sortable (no aria-sort).",
    "A search input (type=\"search\", aria-label \"Search products\") filters by product name, case-insensitive, and returns to page 1. When nothing matches show `No products match “<query>”`; with no products at all show \"No products yet\".",
    "Stock status: stock 1–5 shows a \"Low\" badge in the row, stock 0 shows an \"Out of stock\" badge; higher stock shows no badge.",
    "Selection: each row has a checkbox with aria-label \"Select <name>\"; the header has a checkbox labelled \"Select all on this page\" that is checked when every row of the current page is selected and `indeterminate` when only some are. Selection is by product id and survives paging, sorting and searching. While anything is selected a role=\"status\" bar shows \"N selected\", a \"Mark out of stock\" button that calls onBulkUpdate(ids) (ids in the order of the `products` prop) and then clears the selection, and a \"Clear selection\" button.",
    "Inline stock edit: the stock number is a button named \"Edit stock for <name>\". Clicking it replaces the number with an <input type=\"number\"> named \"Stock for <name>\", prefilled with the current stock and focused. Enter saves by calling onStockChange(id, number) — only for a whole number ≥ 0 — and leaves edit mode; Escape cancels without calling anything. For invalid input (empty, negative, decimal) stay in edit mode and show a role=\"alert\" saying \"Enter a whole number, 0 or more\". The component never stores the saved value itself: it always renders `product.stock` from props.",
    "Pagination: a <nav aria-label=\"Pagination\"> with \"Previous\" and \"Next\" buttons (disabled on the first/last page), the text \"Page 1 of 3\" and the range text \"Showing 1–5 of 12\" (en dash; the total is the number of products after searching). Default pageSize is 5 (a `pageSize` prop overrides it). The current page is clamped when the list shrinks.",
  ],
  expectedBehavior: [
    "The rows on screen are derived from the `products` prop: filter by search, then sort, then paginate. Parent updates (a saved stock value, new products) show immediately.",
    "Selecting a row, changing the sort and going to another page never loses or mixes up selected products.",
    "The component never mutates the `products` array it is given (sorting works on a copy).",
  ],
  reproSteps: [
    "Press Run and open the Demo: the table is a plain unpaged list without any interactions.",
    "Open the Target UI tab and try everything: sort each column twice, search, select rows on two pages, use the bulk action, edit a stock number (also try -1 and 2.5).",
    "Use the Demo's \"30 products\" and \"No products\" datasets to check paging and the empty state while you build, and watch the Console for your callbacks.",
  ],
  acceptanceCriteria: [
    "tableUtils helpers (nextSort, filterProducts, sortProducts, pageCount, paginate, stockStatus, parseStock) behave exactly as documented in the skeleton.",
    "Sorting cycles with correct aria-sort values and sorts across all pages without mutating the input.",
    "Search, pagination text and button states are correct, and the page is clamped.",
    "Selection by id, a correct header checkbox (checked / indeterminate) and a bulk action that calls onBulkUpdate with ids in prop order.",
    "Inline stock editing validates, calls onStockChange only for valid numbers, and Escape cancels.",
  ],
  edgeCases: [
    "Page 3 selected, then a search shrinks the list to a single page",
    "Select-all on page 2 after selecting two rows on page 1",
    "Sort by stock when two products have the same stock (stable original order)",
    "Edit input \"0\" (valid), \"\" / \"-3\" / \"2.5\" (invalid), \" 7 \" (valid, trimmed)",
    "products prop changes while a row is selected (the selected product disappears)",
  ],
  hints: [
    "Model the table as a pipeline of pure functions: products → filterProducts → sortProducts → paginate. Write and check those helpers first, they are tested directly.",
    "Array.prototype.sort mutates its array. Sort a copy ([...products]) or you will reorder the parent's state.",
    "Store selected ids in a Set (copy it before changing, so React sees a new value) — never row indexes. Derive 'all selected on this page' and 'some selected' from the visible rows.",
    "`indeterminate` is a DOM property, not an attribute: set it on the checkbox through a ref inside an effect.",
    "Number(\"\") is 0 and Number(\"2.5\") is 2.5, so validate the text (e.g. /^\\d+$/ after trim) before converting to a number.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise. The main traps are sorting or paging only the visible rows, keeping selection by index instead of by id, mutating the props array while sorting, and accepting invalid numbers because Number() is too forgiving.",
    fix: "Build the table as derived data (filter → sort → paginate) from the full list on every render, keep only user-controlled state (query, sort, page, selected ids), clamp the page, copy before sorting and copy Sets before updating. A small pure parseStock plus a controlled-by-props StockCell keeps validation and editing simple.",
    takeaways: [
      "Derive the visible rows from the whole data set; state holds only what the user controls.",
      "Select by stable id, and treat Sets/arrays in state as immutable.",
      "aria-sort on <th> and real <table> semantics make a data table accessible for free.",
      "Validate user input text before converting it.",
    ],
  },
  expectedFailures: ["sort", "paginat", "selection", "search", "stock"],
});
