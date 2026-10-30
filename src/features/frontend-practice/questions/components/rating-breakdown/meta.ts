import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "rating-breakdown",
  title: "Build the product rating breakdown",
  topic: "components",
  difficulty: "easy",
  kind: "build",
  minutes: 25,
  summary: "Average rating, review count and a 5-to-1 star distribution with progress bars.",
  scenario:
    "The product page shows a flat list of reviews. Product wants a summary above it, like every big marketplace: the average rating, how many reviews it is based on, and a bar per star level showing how the ratings are distributed.\n\n" +
    "Implement RatingBreakdown in src/components/RatingBreakdown.jsx. It receives the product's reviews (each with a whole-number rating from 1 to 5). Use the Demo to try a mixed, a single-review, an all-five-star and an empty product; the Target UI tab shows the finished summary.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/types/index.ts"],
  editableFiles: ["src/components/RatingBreakdown.jsx"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "A card with the average rating on the left, alone in its own element, rounded to ONE decimal and always showing the decimal (\"4.3\", \"4.0\"), next to a row of five star icons and the text \"Based on <n> reviews\" (\"Based on 1 review\" when n is 1).",
    "On the right, a <ul> with aria-label=\"Rating distribution\" containing exactly five <li> rows in the order 5, 4, 3, 2, 1. Each row has the text \"<n> stars\" (\"1 star\" for one), a bar, and the number of reviews with that rating.",
    "Each bar is an element with role=\"progressbar\", aria-label equal to the row label (\"5 stars\"), aria-valuemin=\"0\", aria-valuemax=\"100\" and aria-valuenow equal to the share of all reviews in whole percent (3 of 7 reviews is 43). The visible fill uses the same percentage as its width.",
    "With no reviews show only the text \"No reviews yet\" (no average, no rows, no progressbars).",
    "The fill colour is bg-app-warning on a bg-app-cream-dark track; the card follows the app style (rounded-2xl, border-app-border, bg-white, p-5).",
  ],
  expectedBehavior: [
    "Everything is derived from the `reviews` prop, so adding or removing reviews updates all numbers.",
    "Percentages are rounded to whole numbers; a rating level with no reviews shows 0.",
    "Ratings outside 1 to 5 are ignored.",
  ],
  reproSteps: [
    "Press Run: the Demo shows an empty stub.",
    "Open the Target UI tab to see the summary for the \"Mixed reviews\" data.",
    "Switch the Demo between \"One review\", \"All five stars\" and \"No reviews\" to check the edge cases while you build.",
  ],
  acceptanceCriteria: [
    "The average is shown with one decimal; the count text handles singular and plural.",
    "Five rows (5 to 1) with label, count and a progressbar with the correct aria-valuenow.",
    "An empty `reviews` array shows \"No reviews yet\" and nothing else.",
    "Ratings are counted correctly, and 0-count rows still render.",
  ],
  edgeCases: ["no reviews", "exactly one review (\"1 review\", \"1 star\" row)", "all reviews with the same rating", "an average like 4.25 or 4.0", "an invalid rating such as 0 or 6"],
  hints: [
    "Create a counts array of length 5 (index 0 is the 1-star count) in a single pass over `reviews`.",
    "average = sum(rating) / total; format with toFixed(1) so 4 becomes \"4.0\". percent = Math.round(count / total * 100).",
    "Map [5, 4, 3, 2, 1] to the rows so the order is explicit, and give the bar's inner fill style={{ width: `${percent}%` }}.",
  ],
  explanation: {
    rootCause: "This is a build exercise, not a bug fix. The main trap is the edge cases: division by zero for an empty product, \"1 reviews\" pluralisation and an average that prints as \"4\" instead of \"4.0\".",
    fix: "Derive total, counts per star, average and percentages from `reviews` during render. Handle the empty case first, then render the summary and five rows from a [5, 4, 3, 2, 1] array.",
    takeaways: [
      "Guard divisions by zero before computing percentages.",
      "role=\"progressbar\" with aria-valuenow makes visual bars readable to assistive tech.",
      "Derive everything from props instead of caching counts in state.",
    ],
  },
  expectedFailures: ["average", "distribution", "empty", "progressbar"],
});
