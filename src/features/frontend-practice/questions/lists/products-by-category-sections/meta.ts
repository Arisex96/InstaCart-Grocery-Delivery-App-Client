import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "products-by-category-sections",
  title: "Grouped product list shows slugs, wrong order and reshuffles the catalogue",
  topic: "lists",
  difficulty: "medium",
  minutes: 25,
  summary: "Group products into category sections: header names, fixed order, sorted rows, no mutation.",
  scenario:
    "Merchandising wants the \"Shop by aisle\" page: products grouped into sections under their category name, in the same order as the category list in the store (Fruits & Vegetables, Dairy & Eggs, Bakery …), with products sorted by name inside each section. The first implementation ships three visible problems: headers show raw slugs like \"fruits-vegetables\", the sections come out in whatever order the first product of each category appears in the API response, and \"apple\" sorts after \"Banana\".\n\n" +
    "Worse, the Products page that renders the same array above it reorders itself after this component mounts. GroupedProducts receives the catalogue and the category list (the same shape as categoriesData in src/assets/assets.ts) as props.",
  inspiredBy: ["client/src/pages/Products.tsx", "client/src/components/ProductGrid.tsx", "client/src/assets/assets.ts"],
  editableFiles: ["src/components/GroupedProducts.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "One section per category that has products, in the order of the `categories` prop, with the category name (not slug) and the product count as header: \"Bakery (2)\".",
    "Categories without products are not rendered.",
    "Products whose category is not in `categories` are collected in a last section called \"Other\".",
    "Inside a section products are sorted by name, case-insensitively (apple before Banana).",
    "The `products` prop is never mutated and every product appears exactly once.",
  ],
  reproSteps: [
    "Press Run. The headers read \"snacks\", \"bakery\"… instead of \"Snacks\", \"Bakery\".",
    "Compare the section order with the category list printed above the grid: it differs.",
    "Look at the \"Order of the original array\" line in the preview: it changed after the grouped list rendered.",
  ],
  acceptanceCriteria: [
    "Headers use category names and counts, sections follow the `categories` order.",
    "Unknown categories end up under \"Other\" (last); empty categories disappear.",
    "Rows are sorted by name with localeCompare, with stable results for equal names.",
    "Props are treated as immutable and React keys are stable ids, not indexes.",
  ],
  edgeCases: [
    "A product with a category that is not in the category list",
    "A category in the list that has no products",
    "Names that differ only by letter case",
    "The same array rendered elsewhere on the page",
  ],
  hints: [
    "Start from the category list, not from the products: it already has the order and the display names.",
    "Array.prototype.sort sorts in place. What does that do to the array that came in through props?",
    "Build a Map (or object) from slug to products first, then walk `categories` and read from it; collect what is left over into \"Other\". Use localeCompare for names.",
  ],
  explanation: {
    rootCause:
      "The component grouped with `{}` keyed by whatever it met first, so section order followed the data, headers printed the slug (the display name lives in `categories`, which was ignored), and unknown slugs were treated like real categories. Sorting used `<` on strings and ran `products.sort`, which mutates the prop array and puts uppercase before lowercase.",
    fix: "Copy before sorting, sort with localeCompare, group into a Map, then iterate the `categories` prop to emit sections (skipping empty ones) and append an \"Other\" section for leftovers. Key sections by slug and rows by product _id.",
    takeaways: [
      "Never sort a prop in place: copy first ([...list].sort()).",
      "Let the ordered reference data (categories) drive the output order.",
      "Group first, render second; keys come from ids, not positions.",
    ],
  },
  expectedFailures: ["order of the categories", "category names", "does not mutate", "Other", "case-insensitively"],
});
