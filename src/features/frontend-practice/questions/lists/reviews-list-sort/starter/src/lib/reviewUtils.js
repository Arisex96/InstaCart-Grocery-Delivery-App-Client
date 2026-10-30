// src/lib/reviewUtils.js: pure helpers for the reviews list (no React in here).
// Review shape: { _id, name, rating (1-5), date (ISO string), comment, helpful? }
//
// The exact rules are in the UI requirements (Problem tab). Today these are stubs, so the
// component built on top of them cannot work yet.

/** "Today" / "Yesterday" / "3 days ago" / "1 week ago" / "2 months ago" / "1 year ago". */
export function relativeDate(date, now = new Date()) {
  // TODO: compare UTC calendar days between `date` and `now`.
  return "";
}

/** Returns a NEW sorted array. mode: "newest" | "highest" | "lowest". Never mutates `reviews`. */
export function sortReviews(reviews, mode) {
  // TODO: copy, sort by the mode, break ties by newer date first.
  return reviews;
}

/** { 5: n, 4: n, 3: n, 2: n, 1: n } */
export function countByRating(reviews) {
  // TODO
  return {};
}
