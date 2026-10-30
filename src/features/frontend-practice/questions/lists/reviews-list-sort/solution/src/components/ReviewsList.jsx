// src/components/ReviewsList.jsx: the reviews section of the product page
// (see client/src/pages/ProductPage.tsx and client/src/assets/DummyReviewsSection.tsx).
//
// Props
//   reviews   [{ _id, name, rating, date (ISO), comment, helpful? }]
//   now       Date used for relative dates (defaults to the current time; the Demo pins it)
import { useState } from "react";
import { StarIcon } from "lucide-react";
import { countByRating, relativeDate, sortReviews } from "../lib/reviewUtils";

const PAGE_SIZE = 3;
const SORTS = [
  ["newest", "Newest"],
  ["highest", "Highest rated"],
  ["lowest", "Lowest rated"],
];
const STARS = [5, 4, 3, 2, 1];
const plural = (n, one, many) => (n === 1 ? one : many);

const ReviewsList = ({ reviews, now = new Date() }) => {
  // APPROACH: the only state is what the shopper did (sort, filter, how far they scrolled and
  // which reviews they voted for). Everything shown is derived from props + that state.
  const [sort, setSort] = useState("newest");
  const [rating, setRating] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [voted, setVoted] = useState(() => new Set());

  const counts = countByRating(reviews);
  const filtered = rating === "all" ? reviews : reviews.filter((r) => r.rating === rating);
  const sorted = sortReviews(filtered, sort); // sortReviews copies, so `reviews` stays untouched
  const shown = sorted.slice(0, visible);

  // Changing the sort or the filter starts the list again at one page.
  const changeSort = (value) => {
    setSort(value);
    setVisible(PAGE_SIZE);
  };
  const changeRating = (value) => {
    setRating(value);
    setVisible(PAGE_SIZE);
  };

  // Votes are keyed by review id (not by position) so they survive re-sorting. Clicking again
  // removes the vote, so nobody can add more than one.
  const toggleVote = (id) =>
    setVoted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chip = (active) =>
    `rounded-full border px-3 py-1 text-xs font-semibold ${
      active ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text hover:bg-app-cream"
    }`;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">Customer reviews</h2>
      <p className="text-sm text-app-text-light">
        {reviews.length} {plural(reviews.length, "review", "reviews")}
      </p>

      {reviews.length === 0 ? (
        <p className="mt-4 rounded-xl bg-app-cream p-4 text-sm text-app-text-light">No reviews yet</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-app-text">
              Sort by
              <select
                value={sort}
                onChange={(e) => changeSort(e.target.value)}
                className="rounded-xl border border-app-border bg-white px-3 py-1.5 text-sm"
              >
                {SORTS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div role="group" aria-label="Filter by rating" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-label={`All (${reviews.length})`}
                aria-pressed={rating === "all"}
                onClick={() => changeRating("all")}
                className={chip(rating === "all")}
              >
                All ({reviews.length})
              </button>
              {STARS.map((stars) => (
                <button
                  key={stars}
                  type="button"
                  aria-label={`${stars} ${plural(stars, "star", "stars")} (${counts[stars]})`}
                  aria-pressed={rating === stars}
                  onClick={() => changeRating(stars)}
                  className={chip(rating === stars)}
                >
                  {stars}★ ({counts[stars]})
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-xl bg-app-cream p-4 text-sm text-app-text-light">
              <p>No reviews with this rating</p>
              <button
                type="button"
                onClick={() => changeRating("all")}
                className="mt-2 rounded-full bg-app-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-app-green-light"
              >
                Show all reviews
              </button>
            </div>
          ) : (
            <>
              <p role="status" className="mt-4 text-xs text-app-text-light">
                Showing {shown.length} of {filtered.length}
              </p>
              <ul aria-label="Reviews" className="mt-2 flex flex-col gap-3">
                {shown.map((review) => {
                  const hasVoted = voted.has(review._id);
                  return (
                    <li key={review._id} className="rounded-xl border border-app-cream-dark p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-app-text">{review.name}</span>
                        <span className="text-xs text-app-text-light">{relativeDate(review.date, now)}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-app-text-light">
                        <StarIcon className="size-3.5 fill-app-warning text-app-warning" aria-hidden="true" />
                        Rated {review.rating} out of 5
                      </p>
                      <p className="mt-2 text-sm text-app-text">{review.comment}</p>
                      <button
                        type="button"
                        aria-pressed={hasVoted}
                        onClick={() => toggleVote(review._id)}
                        className={`mt-3 rounded-full border px-3 py-1 text-xs font-semibold ${
                          hasVoted ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
                        }`}
                      >
                        Helpful ({(review.helpful ?? 0) + (hasVoted ? 1 : 0)})
                      </button>
                    </li>
                  );
                })}
              </ul>

              {shown.length < filtered.length && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="mt-4 rounded-full border border-app-green px-5 py-2 text-sm font-semibold text-app-green hover:bg-app-cream"
                >
                  Show more
                </button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
};

export default ReviewsList;
