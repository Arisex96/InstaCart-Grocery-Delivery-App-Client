// src/components/RatingStars.jsx — extracted from the StarRating helper in client/src/pages/ProductPage.tsx
// so ProductCard, ProductPage and the review form can share it.
//
// Props
//   rating    number, normally 0–5 (the API occasionally sends garbage)
//   readOnly  display only (product card, reviews list)
//   onChange  input mode (review form): called with the chosen star count, 1..5
//   size      icon size in px
//
// Each star wrapper carries data-fill="full" | "half" | "empty" (used by the design-system tests).
import { Star } from "lucide-react";

const MAX = 5;

const StarIcon = ({ fill, size }) => {
  if (fill === "half") {
    // Empty star underneath, filled star clipped to the left half on top.
    return (
      <span className="relative inline-flex">
        <Star size={size} className="text-zinc-300" />
        <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          <Star size={size} className="fill-app-warning text-app-warning" />
        </span>
      </span>
    );
  }
  return <Star size={size} className={fill === "full" ? "fill-app-warning text-app-warning" : "text-zinc-300"} />;
};

const RatingStars = ({ rating = 0, onChange, readOnly = false, size = 16 }) => {
  // ROOT CAUSE: the list was built from Math.round(rating) — no halves, more than five entries for
  // rating > 5, and Array(-1) / Array(NaN) throwing a RangeError.
  // FIX: normalise once (finite, clamped to 0–5, nearest 0.5), then build exactly MAX slots.
  const value = Number.isFinite(rating) ? Math.min(MAX, Math.max(0, rating)) : 0;
  const rounded = Math.round(value * 2) / 2;
  const fills = Array.from({ length: MAX }, (_, i) => (rounded >= i + 1 ? "full" : rounded === i + 0.5 ? "half" : "empty"));

  const interactive = !readOnly && typeof onChange === "function";

  // Read-only: one image with a text alternative. Nothing inside is clickable, onChange is never called.
  if (!interactive) {
    return (
      <div role="img" aria-label={`${rounded} out of ${MAX} stars`} className="flex items-center gap-0.5">
        {fills.map((fill, index) => (
          <span key={index} data-fill={fill} className="inline-flex">
            <StarIcon fill={fill} size={size} />
          </span>
        ))}
      </div>
    );
  }

  // Interactive: native buttons give focus, Tab order, Enter/Space and an accessible name for free.
  return (
    <div role="group" aria-label="Rating" className="flex items-center gap-0.5">
      {fills.map((fill, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Rate ${index + 1} star${index === 0 ? "" : "s"}`}
          aria-pressed={index < Math.round(value)}
          onClick={() => onChange(index + 1)}
          className="inline-flex rounded p-0.5 hover:scale-110 focus-visible:outline-2 focus-visible:outline-app-orange"
        >
          <span data-fill={fill} className="inline-flex">
            <StarIcon fill={fill} size={size} />
          </span>
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
