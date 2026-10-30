import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "reviews-list-sort",
  title: "Build the reviews list with sorting, filters and Show more",
  topic: "lists",
  difficulty: "medium",
  kind: "build",
  minutes: 35,
  summary: "Sort, star-filter and paginate reviews, with helpful votes and relative dates.",
  scenario:
    "The product page's review section is a static dummy today. Design wants the real thing: a sort dropdown, star filter chips with counts, a Show more button that reveals three reviews at a time, a Helpful button per review, and friendly relative dates (\"3 days ago\").\n\n" +
    "Implement the two helpers in src/lib/reviewUtils.js and the ReviewsList component in src/components/ReviewsList.jsx. The reviews come from src/data/reviews.js (read-only) and the Demo pins \"now\" to a fixed date so the relative dates are predictable. The Target UI tab shows the finished list.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/assets/DummyReviewsSection.tsx"],
  editableFiles: ["src/components/ReviewsList.jsx", "src/lib/reviewUtils.js"],
  previewEntry: "src/Demo.jsx",
  uiSpec: [
    "src/lib/reviewUtils.js exports relativeDate(date, now), sortReviews(reviews, mode) and countByRating(reviews). relativeDate compares UTC calendar days: 0 days \"Today\", 1 \"Yesterday\", 2–6 \"N days ago\", 7–29 \"1 week ago\" / \"N weeks ago\" (floor of days / 7), 30–364 \"1 month ago\" / \"N months ago\" (floor of days / 30), 365+ \"1 year ago\" / \"N years ago\" (floor of days / 365). A future date counts as \"Today\".",
    "sortReviews returns a NEW array and never mutates its input. Modes: \"newest\" (date descending), \"highest\" and \"lowest\" (rating descending / ascending); ties always put the newer review first. countByRating returns an object { 5: n, 4: n, 3: n, 2: n, 1: n }.",
    "ReviewsList({ reviews, now = new Date() }) renders an <h2> \"Customer reviews\" and a count line \"8 reviews\" (\"1 review\"). With no reviews it shows only \"No reviews yet\".",
    "Controls: a <select> labelled \"Sort by\" with options Newest (default), Highest rated and Lowest rated; and a group labelled \"Filter by rating\" with buttons aria-labelled \"All (8)\", \"5 stars (3)\", … \"1 star (1)\" (visible text may be shorter). The active one has aria-pressed=\"true\" (All initially). Chips with a count of 0 stay enabled.",
    "The list is a <ul> labelled \"Reviews\". Each <li> shows the reviewer name, \"Rated 4 out of 5\", the relative date, the comment and a button named \"Helpful (N)\" with aria-pressed. Clicking adds 1 and presses it; clicking again removes the vote (so a shopper can never add more than one). Votes survive sorting and filtering, and the input objects are never changed.",
    "Only 3 reviews are shown at first. A role=\"status\" line reads \"Showing 3 of 8\" and a \"Show more\" button reveals 3 more per click, disappearing once everything is shown. Changing the sort or the filter starts again at 3.",
    "A filter with no matching reviews shows \"No reviews with this rating\" and a \"Show all reviews\" button that resets the filter to All.",
  ],
  expectedBehavior: [
    "Sorting and filtering always work on a copy; the reviews prop is never changed.",
    "The count in each chip is based on all reviews, while the list and the \"Showing X of Y\" line follow the active filter.",
    "A helpful vote belongs to a review, not to a position in the list.",
  ],
  reproSteps: [
    "Press Run: the Demo shows 8 reviews with a fixed \"now\" of 10 Mar 2026 (the stub renders nothing useful yet).",
    "Open the Target UI tab to see the finished list, then try Show more, the filters and the Helpful buttons there.",
    "Use the Demo's data buttons (8 reviews, One review, No reviews) to check the other states.",
  ],
  acceptanceCriteria: [
    "relativeDate, sortReviews and countByRating behave exactly as specified (including ties and singular/plural).",
    "Sort select and star chips work together and reset Show more.",
    "Show more reveals 3 at a time with an accurate \"Showing X of Y\".",
    "Helpful votes toggle once per review and persist across re-sorting.",
    "Empty filter and empty list states are handled; the input is never mutated.",
  ],
  edgeCases: [
    "two reviews with the same rating and the same date",
    "exactly 7, 29, 30 and 365 days ago",
    "a filter that matches fewer than 3 reviews (no Show more)",
    "a frozen reviews array",
    "reviews with no `helpful` field",
  ],
  hints: [
    "Keep the raw props untouched: sort a copy ([...reviews].sort) or build the order from a filtered copy, and keep votes in a Set of review ids.",
    "Derive counts, the filtered list, the sorted list and the visible slice from props and state during render: no effect and no duplicated state.",
    "Reset the visible count inside the sort / filter change handlers, where you already know the user changed something.",
    "For relativeDate, normalise both dates to the start of their UTC day first, then divide by 86 400 000 ms and floor.",
  ],
  explanation: {
    rootCause:
      "This is a build exercise, so there is no bug to find. The traps are array.sort mutating its input, ties that make the order unstable between modes, date maths across time zones and times of day, and state that belongs to a position instead of a review id.",
    fix: "Put the pure logic in reviewUtils.js (copy before sorting, tie-break by date, UTC-day arithmetic), keep only sort, filter, visible count and a Set of voted ids in state, and derive everything else while rendering.",
    takeaways: [
      "Never sort props in place; copy first.",
      "Make comparators total: add a tie-breaker so the order is deterministic.",
      "Key per-item UI state by id, not by index.",
    ],
  },
  expectedFailures: ["relative date", "sorts", "counts", "show more", "helpful"],
});
