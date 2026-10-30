// src/components/RatingBreakdown.jsx — summary shown above the review list on the product page
// (client/src/pages/ProductPage.tsx renders the reviews below it).
//
// Props
//   reviews   [{ _id, rating, comment }]   rating is a whole number from 1 to 5
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it with a few
// review sets, and the Target UI output tab shows the finished design.
import { StarIcon } from "lucide-react";

const RatingBreakdown = ({ reviews }) => {
  // TODO: total, average (one decimal) and the number of reviews per star level.
  // TODO: "No reviews yet" when there are none (careful with division by zero).
  // TODO: five rows 5 -> 1, each with a label, a role="progressbar" bar and the count.
  void reviews;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h3 className="flex items-center gap-2 font-serif text-lg text-app-green">
        <StarIcon className="size-5 fill-app-warning text-app-warning" /> Ratings
      </h3>
      <p className="mt-2 text-sm text-app-text-light">Rating summary goes here.</p>
    </section>
  );
};

export default RatingBreakdown;
