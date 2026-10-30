// src/Demo.jsx: read-only. The live preview renders this file's default export.
// "now" is pinned to 10 Mar 2026 so the relative dates ("Today", "5 days ago", "1 year ago") are
// predictable while you build. Switch data sets to check every state of your ReviewsList.
import { useState } from "react";
import ReviewsList from "./components/ReviewsList";
import { reviews } from "./data/reviews";

const NOW = new Date("2026-03-10T12:00:00Z");

const SETS = {
  "8 reviews": reviews,
  "One review": reviews.slice(0, 1),
  "No reviews": [],
  "No 1-star or 2-star": reviews.filter((r) => r.rating >= 3),
};

export default function Demo() {
  const [name, setName] = useState("8 reviews");
  return (
    <div className="mx-auto max-w-xl space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.keys(SETS).map((key) => (
          <button
            key={key}
            onClick={() => setName(key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              key === name ? "border-app-green bg-app-green text-white" : "border-app-border bg-white text-app-text"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <p className="text-xs text-app-text-light">"Today" is 10 Mar 2026 in this demo.</p>
      <ReviewsList reviews={SETS[name]} now={NOW} />
    </div>
  );
}
