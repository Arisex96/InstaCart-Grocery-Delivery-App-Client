// src/lib/reviewUtils.js: pure helpers for the reviews list (no React in here).
// Review shape: { _id, name, rating (1-5), date (ISO string), comment, helpful? }

const DAY = 24 * 60 * 60 * 1000;

// APPROACH: compare whole UTC days, not timestamps. Subtracting raw timestamps would make
// "9 PM yesterday" look like 0 days ago and depends on the viewer's time zone.
const utcDay = (value) => {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const unit = (n, singular) => (n === 1 ? `1 ${singular} ago` : `${n} ${singular}s ago`);

/** "Today" / "Yesterday" / "3 days ago" / "1 week ago" / "2 months ago" / "1 year ago". */
export function relativeDate(date, now = new Date()) {
  const days = Math.floor((utcDay(now) - utcDay(date)) / DAY);
  if (days <= 0) return "Today"; // future dates also read as Today
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return unit(Math.floor(days / 7), "week");
  if (days < 365) return unit(Math.floor(days / 30), "month");
  return unit(Math.floor(days / 365), "year");
}

const byNewest = (a, b) => new Date(b.date) - new Date(a.date);

const COMPARATORS = {
  newest: byNewest,
  // Ties fall back to newest so the order is deterministic (a total order).
  highest: (a, b) => b.rating - a.rating || byNewest(a, b),
  lowest: (a, b) => a.rating - b.rating || byNewest(a, b),
};

/** Returns a NEW sorted array. mode: "newest" | "highest" | "lowest". Never mutates `reviews`. */
export function sortReviews(reviews, mode) {
  // ROOT CAUSE of the classic bug: Array.prototype.sort sorts IN PLACE, so sorting the prop
  // would reorder (or throw on) the parent's data. FIX: sort a copy.
  return [...reviews].sort(COMPARATORS[mode] ?? byNewest);
}

/** { 5: n, 4: n, 3: n, 2: n, 1: n } */
export function countByRating(reviews) {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of reviews) counts[review.rating] += 1;
  return counts;
}
