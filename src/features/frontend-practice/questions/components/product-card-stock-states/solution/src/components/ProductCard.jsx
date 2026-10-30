// src/components/ProductCard.jsx — trimmed copy of client/src/components/ProductCard.tsx.
// Rendered by the Products page grid, the home page "Featured" row and search results.
//
// Product shape (see src/data/products.js):
//   { _id, name, price, originalPrice, discount, image, unit, stock, isOrganic, rating, reviewCount }
// `stock` is the number of units left in the warehouse; `discount` is a percentage (0 = no discount).
import { StarIcon, PlusIcon, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../store/useCartStore";

const LOW_STOCK_THRESHOLD = 5;

const ProductCard = ({ product }) => {
  const add_item = useCartStore((state) => state.add_item);
  const navigate = useNavigate();
  const { name, image, price, originalPrice, discount, rating, reviewCount, unit, isOrganic, stock } = product;

  // FIX (stock): derive the states once and reuse them for the label and the button.
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  const handleAddToCart = (e) => {
    // The whole card navigates to the product page; adding must not.
    e.stopPropagation();
    // FIX (stock): a disabled button never fires click, but guard anyway so the
    // handler stays correct if it is ever called some other way.
    if (isOutOfStock) return;
    add_item(product, 1);
  };

  return (
    <div
      className="group relative rounded-2xl border border-app-border bg-white p-4 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => navigate("/product/" + product._id)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        {/* ROOT CAUSE (stray 0): `discount && <span/>` evaluates to `discount` itself when it is 0,
            and React renders the number 0. FIX: compare explicitly so the left side is a boolean. */}
        {discount > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2.5 py-1 shadow-sm leading-none">
            {discount}% OFF
          </span>
        )}
        {isOrganic && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full px-2 py-1 shadow-sm flex items-center gap-0.5 leading-none">
            <Leaf className="size-2.5 fill-white" /> Organic
          </span>
        )}
      </div>

      {/* Image */}
      <div className="bg-app-cream/40 rounded-xl flex h-32 items-center justify-center p-2 overflow-hidden">
        <img src={image} alt={name} className="max-h-full max-w-full object-contain" />
      </div>

      {/* Details */}
      <div className="flex flex-col grow gap-1">
        <p className="font-bold text-app-text text-sm sm:text-base line-clamp-1">{name}</p>
        <div className="flex items-center gap-1">
          <StarIcon className="size-4 text-app-warning fill-app-warning" />
          <span className="text-xs font-semibold text-app-text-light">{rating}</span>
          <span className="text-zinc-400 text-xs">({reviewCount})</span>
        </div>
        {isOutOfStock && <p className="text-xs font-semibold text-app-error">Out of stock</p>}
        {isLowStock && <p className="text-xs font-semibold text-app-warning">Only {stock} left</p>}
      </div>

      {/* Price & add button */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-app-cream-dark">
        <div className="flex flex-col">
          <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">{unit || "Unit"}</span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-app-green text-base">${price.toFixed(2)}</span>
            {discount > 0 && originalPrice > price && (
              <span className="text-zinc-400 line-through text-xs">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="bg-app-green text-white p-2 rounded-full hover:bg-app-green-light transition-all shadow-md hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
