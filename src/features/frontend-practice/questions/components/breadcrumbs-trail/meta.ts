import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "breadcrumbs-trail",
  title: "Breadcrumbs crash on retired categories and mislead screen readers",
  topic: "components",
  difficulty: "easy",
  minutes: 15,
  summary: "Breadcrumbs crash for unknown category slugs, link \"All\" to a bogus URL and are not a nav landmark.",
  scenario:
    "Customer support forwarded three reports about the trail above the product grid (\"Home / Bakery / Butter Croissant\"). Opening a product from a seasonal category that was removed from the catalogue white-screens the whole page. Clicking the \"All Products\" crumb lands on /products?category=all, which the filters sidebar then shows as an unknown category. And an accessibility audit found that screen readers announce the trail as a pile of unrelated buttons, including the current product name, which is not even a link.\n\n" +
    "This is a trimmed copy of src/components/Breadcrums.tsx. Fix it without changing its props or its visual design.",
  inspiredBy: ["client/src/components/Breadcrums.tsx", "client/src/pages/ProductPage.tsx"],
  editableFiles: ["src/components/Breadcrumbs.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The trail is a navigation landmark labelled \"Breadcrumb\".",
    "A category slug the catalogue does not know is shown as-is instead of crashing; an explicit activeCategoryLabel always wins.",
    "The \"all\" category reads \"All Products\" and links to /products (no query string); other categories link to /products?category=<slug>.",
    "The last crumb (the product name) is plain text marked as the current page, not a button.",
  ],
  reproSteps: [
    "Press Run and look at the first trail: the product name \"Butter Croissant 100g\" is rendered like a clickable crumb.",
    "Click the \"All Products\" crumb in the second trail and read the \"Current URL\" line: it shows ?category=all.",
    "Click \"Open a product from a retired category\": the whole preview turns into a render error.",
  ],
  acceptanceCriteria: [
    "The component renders a <nav> with the accessible name \"Breadcrumb\".",
    "No crash for unknown slugs; the raw slug is the fallback label.",
    "\"All Products\" navigates to /products; Bakery navigates to /products?category=bakery; Home navigates to /.",
    "The product name is not a button and carries aria-current=\"page\".",
  ],
  edgeCases: [
    "activeCategory omitted (defaults to \"all\")",
    "activeCategoryLabel provided together with an unknown slug",
    "no activeProductName (trail ends at the category)",
  ],
  hints: [
    "Array.prototype.find returns undefined when nothing matches. What happens when you read a property of it?",
    "Which element exposes \"this is a navigation region\" to assistive technology, and how do you name it when a page has several?",
    "The current location in a trail is not a link. Which ARIA attribute says \"this is where you are\"?",
  ],
  explanation: {
    rootCause:
      "The label lookup did `categories.find(...).name`, which throws when the slug is not in the catalogue. The \"all\" click handler built the URL from the slug unconditionally (`?category=all`). The wrapper was a plain div and the current page was rendered with the same button markup as the links, so there was no landmark and no current-page semantics.",
    fix: "Use optional chaining with the slug as fallback, branch the navigation target for \"all\", wrap the trail in <nav aria-label=\"Breadcrumb\"> and render the last crumb as a span with aria-current=\"page\".",
    takeaways: [
      "Lookups into data you do not control need a fallback.",
      "Choose elements for their semantics: nav for navigation, links/buttons for actions, plain text for the current page.",
      "Default values in props (\"all\") are real values that URLs and filters must understand.",
    ],
  },
  expectedFailures: ["navigation landmark", "all products", "does not know", "current page"],
});
