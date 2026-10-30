// src/components/WishlistButton.jsx — read-only. The heart toggle used on product cards.
// This file is correct; it only shows how the hook and panel are meant to be used.
import { Heart } from "lucide-react";

const WishlistButton = ({ product, wished, onToggle }) => (
  <button
    onClick={() => onToggle(product._id)}
    aria-pressed={wished}
    aria-label={(wished ? "Remove " : "Add ") + product.name + (wished ? " from wishlist" : " to wishlist")}
    className="rounded-full border border-app-border bg-white p-2 hover:shadow-md"
  >
    <Heart className={"size-5 " + (wished ? "fill-app-error text-app-error" : "text-app-text-light")} />
  </button>
);

export default WishlistButton;
