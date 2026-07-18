import React from "react";
import { StarIcon, PlusIcon, Leaf } from "lucide-react";
import useCartStore from "../store/useCartStore";
import type { Product } from "../types";
import { useNavigate } from "react-router";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { add_item } = useCartStore();
  const navigate = useNavigate();

  const {
    name,
    image,
    price,
    originalPrice,
    discount,
    rating,
    reviewCount,
    unit,
    isOrganic,
  } = product;

  // Let's compute the displayed price:
  // If price is already discounted in data, we can use price. Or compute based on originalPrice and discount.
  // In assets.ts, price is indeed equal to originalPrice - (originalPrice * discount / 100).
  const displayPrice = price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    add_item(product, 1);
  };

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div
      className="group relative rounded-2xl border border-app-border bg-white p-4 flex flex-col gap-3 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Badges Container */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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

      {/* Product Image */}
      <div className="bg-app-cream/40 rounded-xl flex h-40 items-center justify-center p-2 overflow-hidden relative">
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col grow gap-1">
        <p className="font-bold text-app-text text-sm sm:text-base line-clamp-1 group-hover:text-app-green-lighter transition-colors">
          {name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <StarIcon className="size-4 text-app-warning fill-app-warning" />
          <span className="text-xs font-semibold text-app-text-light">
            {rating}
          </span>
          <span className="text-zinc-400 text-xs">({reviewCount})</span>
        </div>
      </div>

      {/* Price & Add button */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-app-cream-dark">
        <div className="flex flex-col">
          <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
            {unit || "Unit"}
          </span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-app-green text-base">
              ${displayPrice.toFixed(2)}
            </span>
            {discount > 0 && originalPrice > price && (
              <span className="text-zinc-400 line-through text-xs">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="bg-app-green text-white p-2 rounded-full hover:bg-app-green-light transition-all shadow-md hover:scale-110 active:scale-95"
          aria-label="Add to cart"
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
