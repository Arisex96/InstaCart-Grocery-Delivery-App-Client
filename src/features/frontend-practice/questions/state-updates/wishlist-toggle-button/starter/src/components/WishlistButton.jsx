// src/components/WishlistButton.jsx — the heart in the top-right corner of a product card
// (the card itself lives in client/src/components/ProductCard.tsx and is clickable).
//
// Props
//   product    { _id, name, ... }
//   isSaved    boolean — controlled by the parent
//   onToggle   (productId) => void
//
// Build it from the UI requirements in the Problem tab.
import { HeartIcon } from "lucide-react";

const WishlistButton = ({ product, isSaved, onToggle }) => {
  // TODO: expose aria-pressed and an accessible name that says what a click will do.
  // TODO: report the click with onToggle(product._id) without triggering the parent card's onClick.
  // TODO: saved = filled red heart, not saved = outline heart.
  return (
    <button type="button" className="rounded-full bg-white p-2 shadow">
      <HeartIcon className="size-4" />
      <span className="sr-only">{String(isSaved)} {product.name} {typeof onToggle}</span>
    </button>
  );
};

export default WishlistButton;
