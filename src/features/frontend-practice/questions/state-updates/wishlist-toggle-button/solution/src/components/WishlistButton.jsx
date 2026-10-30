// src/components/WishlistButton.jsx — the heart in the top-right corner of a product card
// (the card itself lives in client/src/components/ProductCard.tsx and is clickable).
//
// Props
//   product    { _id, name, ... }
//   isSaved    boolean — controlled by the parent
//   onToggle   (productId) => void
import { HeartIcon } from "lucide-react";

// APPROACH: the button is a pure function of its props. The saved flag lives in the parent
// (so the header counter and every card agree); the button only renders it and reports clicks.
const WishlistButton = ({ product, isSaved, onToggle }) => {
  const handleClick = (e) => {
    // The whole card navigates to the product page; saving must not.
    e.stopPropagation();
    onToggle(product._id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className="rounded-full bg-white p-2 shadow-md transition-all hover:scale-110 active:scale-95"
    >
      <HeartIcon className={`size-4 ${isSaved ? "fill-red-500 text-red-500" : "text-app-text-light"}`} />
    </button>
  );
};

export default WishlistButton;
