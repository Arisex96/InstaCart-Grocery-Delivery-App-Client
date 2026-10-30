// src/components/RatingBreakdown.jsx — summary shown above the review list on the product page
// (client/src/pages/ProductPage.tsx renders the reviews below it).
//
// Props
//   reviews   [{ _id, rating, comment }]   rating is a whole number from 1 to 5
import { StarIcon } from "lucide-react";

const LEVELS = [5, 4, 3, 2, 1];

// APPROACH: one pass over the reviews gives the counts; total, average and percentages are
// derived from them. The empty case returns early, which also avoids dividing by zero.
const RatingBreakdown = ({ reviews }) => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    if (counts[review.rating] !== undefined) counts[review.rating] += 1; // ignore invalid ratings
  }
  const total = LEVELS.reduce((sum, level) => sum + counts[level], 0);

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-app-border bg-white p-5">
        <p className="text-sm text-app-text-light">No reviews yet</p>
      </section>
    );
  }

  const average = (LEVELS.reduce((sum, level) => sum + level * counts[level], 0) / total).toFixed(1);
  const rounded = Math.round(Number(average));

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-app-border bg-white p-5 sm:flex-row sm:items-center">
      <div className="flex shrink-0 flex-col items-center gap-1 sm:w-40">
        <span className="font-serif text-5xl text-app-green">{average}</span>
        <div className="flex" aria-hidden="true">
          {LEVELS.slice()
            .reverse()
            .map((star) => (
              <StarIcon
                key={star}
                className={`size-4 ${star <= rounded ? "fill-app-warning text-app-warning" : "text-app-border"}`}
              />
            ))}
        </div>
        <p className="text-xs text-app-text-light">Based on {total} {total === 1 ? "review" : "reviews"}</p>
      </div>

      <ul aria-label="Rating distribution" className="flex flex-1 flex-col gap-2">
        {LEVELS.map((level) => {
          const label = `${level} ${level === 1 ? "star" : "stars"}`;
          const percent = Math.round((counts[level] / total) * 100);
          return (
            <li key={level} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 text-app-text">{label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-app-cream-dark">
                <div
                  role="progressbar"
                  aria-label={label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                  className="h-full rounded-full bg-app-warning"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-app-text-light">{counts[level]}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default RatingBreakdown;
