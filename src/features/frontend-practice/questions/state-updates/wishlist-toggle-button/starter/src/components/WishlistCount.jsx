// src/components/WishlistCount.jsx — the little "saved" pill in the page header.
//
// Props
//   savedIds   array of product ids (may contain duplicates)
//
// Build it from the UI requirements in the Problem tab.
import { HeartIcon } from "lucide-react";

const WishlistCount = ({ savedIds }) => {
  // TODO: count DISTINCT ids, derived during render (no state).
  // TODO: role="status" + aria-label ("Wishlist: 3 items" / "Wishlist: 1 item" / "Wishlist: empty").
  // TODO: numeric badge, hidden when empty, "9+" above nine.
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm shadow">
      <HeartIcon className="size-4" /> {savedIds.length === 0 ? "" : "?"}
    </span>
  );
};

export default WishlistCount;
