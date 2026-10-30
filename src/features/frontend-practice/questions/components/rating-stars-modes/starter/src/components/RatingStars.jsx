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

const RatingStars = ({ rating = 0, onChange, readOnly = false, size = 16 }) => {
  const full = Math.round(rating);
  const empty = MAX - full;
  const fills = [...Array(full).fill("full"), ...Array(Math.max(empty, 0)).fill("empty")];

  return (
    <div className="flex items-center gap-0.5">
      {fills.map((fill, index) => (
        <span
          key={index}
          data-fill={fill}
          onClick={() => onChange?.(index + 1)}
          className="inline-flex cursor-pointer"
        >
          <Star
            size={size}
            className={fill === "full" ? "fill-app-warning text-app-warning" : "text-zinc-300"}
          />
        </span>
      ))}
    </div>
  );
};

export default RatingStars;
