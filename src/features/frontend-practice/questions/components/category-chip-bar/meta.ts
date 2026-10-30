import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "category-chip-bar",
  title: "Build the category chip bar with product counts",
  topic: "components",
  difficulty: "easy",
  kind: "build",
  minutes: 20,
  summary: "A scrollable row of category chips with live counts, an active state and disabled empty categories.",
  scenario:
    "On mobile the Products page hides its category sidebar. Design wants a horizontally scrollable chip bar above the grid instead: an \"All\" chip plus one chip per category, each showing how many products it would list.\n\n" +
    "Implement CategoryChipBar in src/components/CategoryChipBar.jsx. It receives the categories and the products that are currently loaded, and reports clicks through onChange. The Demo lets you switch the catalogue and the Target UI tab shows the finished bar.",
  inspiredBy: ["client/src/pages/Products.tsx"],
  editableFiles: ["src/components/CategoryChipBar.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "The bar is a container with role=\"group\" and aria-label=\"Categories\". It scrolls horizontally on overflow (no wrapping) and chips never shrink.",
    "Every chip is a real <button>. Its text is \"<Name> (<count>)\", e.g. \"Bakery (2)\". The first chip is \"All (<total number of products>)\", followed by one chip per category in the order of the `categories` prop.",
    "Counts come from `products` by matching product.category to category.slug. A category with no products still shows, as \"<Name> (0)\", and its button is disabled.",
    "The active chip has aria-pressed=\"true\" and the filled style (bg-app-green text-white font-semibold); every other chip has aria-pressed=\"false\" and a white outlined style. `active` defaults to \"all\".",
    "Clicking an enabled chip calls onChange with the category slug, or \"all\" for the All chip. The component is controlled: it does not keep its own active state.",
  ],
  expectedBehavior: [
    "Counts are always derived from the current `products` array and update when it changes.",
    "Disabled chips cannot be clicked and never call onChange.",
    "The All chip is never disabled.",
  ],
  reproSteps: [
    "Press Run: the Demo shows a skeleton with no chips.",
    "Open the Target UI tab to see the bar for the full catalogue.",
    "Switch the Demo to \"Bakery & snacks only\" and check that the other chips show (0) and are disabled.",
  ],
  acceptanceCriteria: [
    "A group named \"Categories\" containing All plus one button per category with the \"<Name> (<count>)\" label.",
    "aria-pressed reflects the `active` prop; clicking calls onChange(slug | \"all\").",
    "Categories without products are shown but disabled.",
    "Counts update when the `products` prop changes.",
  ],
  edgeCases: ["a category with 0 products", "empty products array (All (0))", "unknown product.category values are ignored", "active slug that is not in the list"],
  hints: [
    "You only need one pass over `products` to build a { slug: count } map; look the counts up while mapping the categories.",
    "Build a single `chips` array of { slug, label, count } with All first, then render it with one <button> mapping, so All and categories share the same markup.",
    "Use the `disabled` attribute (not just styling) for empty chips, and compare `slug === active` to set aria-pressed.",
  ],
  explanation: {
    rootCause: "This is a build exercise, not a bug fix. The main trap is keeping a copy of the counts or the active chip in state instead of deriving them from props.",
    fix: "Derive a counts map from `products`, build one chips array (All + categories) and render it with a single button component. Everything else (active styling, disabled) is computed from props during render.",
    takeaways: [
      "Derive display values from props; do not store them in state.",
      "Controlled components are simpler to test and to reuse.",
      "Disabled needs the attribute, not only a grey style.",
    ],
  },
  expectedFailures: ["group", "counts", "disables", "onChange"],
});
