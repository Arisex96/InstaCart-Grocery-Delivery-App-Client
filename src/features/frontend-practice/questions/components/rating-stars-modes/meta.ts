import { defineExercise } from "../../../data/types";

export default defineExercise({
  id: "rating-stars-modes",
  title: "Rating stars round wrongly, overflow and cannot be used with a keyboard",
  topic: "components",
  difficulty: "medium",
  minutes: 25,
  summary: "A reusable RatingStars shows 4.5 as five stars, draws seven stars for bad data and is not accessible.",
  scenario:
    "The product card, the product page and the \"write a review\" form all need the same star widget, so the team extracted RatingStars. Since then: a 4.5 rated product shows five full stars, a feed glitch that returned a rating of 7 drew seven stars and pushed the price off the card, and a rating of -1 crashed the page. The review form's stars cannot be reached with Tab, and on the read-only product card a click on the stars still fires the review form's onChange.\n\n" +
    "RatingStars has two modes: read-only display (product card, reviews list) and interactive input (review form, where onChange receives 1..5). Each star wrapper exposes data-fill=\"full|half|empty\"; keep that attribute, the tests and the design system rely on it.",
  inspiredBy: ["client/src/pages/ProductPage.tsx", "client/src/components/ProductCard.tsx"],
  editableFiles: ["src/components/RatingStars.jsx"],
  shared: ["src/data/products.js"],
  previewEntry: "src/Demo.jsx",
  expectedBehavior: [
    "The rating is clamped to 0–5 (non-numbers count as 0) and rounded to the nearest half star: 4.5 → 4 full + 1 half, 3.7 → 3 full + 1 half, 4.2 → 4 full + 1 empty.",
    "There are always exactly five stars.",
    "Read-only mode is an image with the label \"<n> out of 5 stars\" and never calls onChange.",
    "Interactive mode (not readOnly, onChange given) renders five buttons named \"Rate 1 star\", \"Rate 2 stars\"… that call onChange(n) and are reachable with Tab; Enter activates the focused one.",
  ],
  reproSteps: [
    "Press Run and compare the \"Whole Milk\" rating (4.5) with its stars: all five are filled.",
    "Look at the \"Bad data\" row (rating 7): it draws too many stars.",
    "In the review form try Tab to focus a star: focus skips them. Click a star in the read-only card: the \"Last reported click\" line changes.",
  ],
  acceptanceCriteria: [
    "Half-star rounding works as described, including whole values.",
    "Out-of-range and non-numeric ratings never change the number of stars or crash.",
    "Read-only stars are exposed as a single image with a text alternative and are not interactive.",
    "Interactive stars are real buttons with accessible names, a pressed state and onChange(n).",
  ],
  edgeCases: ["rating 0 and rating 5", "negative, NaN and undefined ratings", "readOnly together with an onChange handler", "singular label \"Rate 1 star\""],
  hints: [
    "Math.round(4.5) is 5. How can you round to a step of 0.5 instead of a step of 1?",
    "Build exactly five entries (Array.from({ length: 5 })) and decide each one's fill from the clamped, rounded rating, instead of building the list from the rating itself.",
    "A clickable span is not focusable and has no role. Which native element gives you focus, Enter/Space and a name for free?",
  ],
  explanation: {
    rootCause:
      "The star list was built from Math.round(rating): half values were impossible, a rating above 5 produced more than five entries and a negative or NaN rating made Array(n) throw a RangeError. Every star was a clickable span, so there was no keyboard access, no accessible name, and read-only displays still called onChange.",
    fix: "Normalise the rating once (finite check, clamp to 0–5, round to the nearest 0.5), always build five entries from fixed indices, and render two modes: a role=\"img\" display with a text label, or five native buttons with aria-labels and aria-pressed that call onChange(n).",
    takeaways: [
      "Normalise inputs at the top of a reusable component, then derive everything from the normalised value.",
      "Build lists from the fixed shape of the UI (five slots), not from data that may be out of range.",
      "Use native interactive elements instead of re-implementing focus and keyboard behaviour on spans.",
    ],
  },
  expectedFailures: ["half star", "out-of-range", "read-only", "buttons", "keyboard"],
});
