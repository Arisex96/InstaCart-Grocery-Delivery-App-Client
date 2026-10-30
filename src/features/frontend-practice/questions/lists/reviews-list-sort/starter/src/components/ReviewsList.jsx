// src/components/ReviewsList.jsx: the reviews section of the product page
// (see client/src/pages/ProductPage.tsx and client/src/assets/DummyReviewsSection.tsx).
//
// Props
//   reviews   [{ _id, name, rating, date (ISO), comment, helpful? }]
//   now       Date used for relative dates (defaults to the current time; the Demo pins it)
//
// Build it from the UI requirements in the Problem tab, using the helpers from
// src/lib/reviewUtils.js. The Demo (src/Demo.jsx) renders this component with several data
// sets, and the "Target UI" output tab shows the finished design.
import { useState } from "react";
import { countByRating, relativeDate, sortReviews } from "../lib/reviewUtils";

const PAGE_SIZE = 3;

const ReviewsList = ({ reviews, now = new Date() }) => {
  // TODO: state for the sort mode, the rating filter, how many reviews are visible, and which
  //       review ids the shopper marked as helpful.
  // TODO: derive counts, the filtered list, the sorted list and the visible slice while rendering.
  // TODO: changing the sort or the filter must start again at PAGE_SIZE visible reviews.

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-xl text-app-green">Customer reviews</h2>
      <p className="mt-3 text-sm text-app-text-light">
        Not built yet ({reviews.length} reviews, page size {PAGE_SIZE}, now = {String(now)}).
      </p>
    </section>
  );
};

export default ReviewsList;
