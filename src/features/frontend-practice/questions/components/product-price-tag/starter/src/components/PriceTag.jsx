// src/components/PriceTag.jsx — the price block used by ProductCard and the product page
// (see client/src/components/ProductCard.tsx and client/src/pages/ProductPage.tsx).
//
// Props
//   product   { price, originalPrice, discount, unit }   (same shape as the catalogue in src/data/products.js)
//             discount is a percentage (0 = none), unit looks like "1 lb", "12 pk", "each"
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it for a few
// sample products and the "Target UI" output tab shows the finished design.

const PriceTag = ({ product }) => {
  const { price } = product;

  // TODO: format money as "$1.20" (two decimals) and show "Free" for a price of 0.
  // TODO: decide when the product is really on sale, then show <del> original + "N% OFF" badge.
  // TODO: price per unit line ("$2.40 / lb").
  // TODO: one visually hidden (sr-only) sentence for screen readers; hide the visual parts with aria-hidden.

  return (
    <div>
      <span className="font-bold text-app-green">{price}</span>
    </div>
  );
};

export default PriceTag;
