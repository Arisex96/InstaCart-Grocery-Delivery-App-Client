// src/Demo.jsx — read-only. The live preview renders this file's default export.
// Switch the review set to check every state of your RatingBreakdown.
import { useState } from "react";
import RatingBreakdown from "./components/RatingBreakdown";

const make = (ratings) => ratings.map((rating, i) => ({ _id: "r" + i, rating, comment: "Review " + (i + 1) }));

const REVIEW_SETS = {
  "Mixed reviews": make([5, 5, 5, 4, 4, 3, 1]), // 7 reviews, average 3.9
  "One review": make([4]),
  "All five stars": make([5, 5, 5, 5]),
  "No reviews": [],
};

export default function Demo() {
  const [name, setName] = useState("Mixed reviews");
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(REVIEW_SETS).map((key) => (
          <button
            key={key}
            onClick={() => setName(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              key === name ? "border-app-orange bg-app-orange text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <RatingBreakdown reviews={REVIEW_SETS[name]} />
    </div>
  );
}
