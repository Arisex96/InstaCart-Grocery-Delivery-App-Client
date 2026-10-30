// src/components/WishlistCount.jsx — the little "saved" pill in the page header.
//
// Props
//   savedIds   array of product ids (may contain duplicates)
import { HeartIcon } from "lucide-react";

// APPROACH: derive everything during render from `savedIds`; storing the count in state would
// let it drift from the list. A Set removes duplicate ids for free.
const WishlistCount = ({ savedIds }) => {
  const count = new Set(savedIds).size;
  const label = count === 0 ? "Wishlist: empty" : `Wishlist: ${count} ${count === 1 ? "item" : "items"}`;

  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-app-border bg-white px-3 py-1 text-sm font-semibold text-app-green shadow-sm"
    >
      <HeartIcon className={`size-4 ${count > 0 ? "fill-red-500 text-red-500" : "text-app-text-light"}`} />
      {count > 0 && (
        <span className="min-w-5 rounded-full bg-app-green px-1.5 text-center text-[11px] font-bold leading-5 text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </span>
  );
};

export default WishlistCount;
