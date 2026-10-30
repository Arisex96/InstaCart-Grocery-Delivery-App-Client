// src/components/ProductDetailPanel.jsx: the main section of the product page
// (client/src/pages/ProductPage.tsx is the real page).
//
// Props
//   product   { _id, name, price, originalPrice, discount, image, unit, stock, rating, reviewCount,
//               description (may be null), category (slug), isOrganic }
//   images    array of image URLs for the gallery (may be empty: fall back to [product.image])
//   reviews   [{ _id, name, rating, comment }]
//   onAdd     (product, quantity) => void
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders this
// component for four sample products, and the "Target UI" output tab shows the finished design.
import { categories } from "../data/products";

const ProductDetailPanel = ({ product, images = [], reviews = [], onAdd }) => {
  // TODO: local state: selected image index, quantity, selected tab, cart message.
  // TODO: derive soldOut / low stock / the gallery list during render, not in state.
  // TODO: reset the local state when `product` changes to a different product.
  // TODO: the tabs must follow the ARIA tabs pattern (roles, ids, roving tabindex, arrow keys).

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h1 className="font-serif text-2xl text-app-green">{product.name}</h1>
      <p className="mt-2 text-sm text-app-text-light">
        Not built yet ({images.length} images, {reviews.length} reviews, {categories.length} categories,
        {onAdd ? " with" : " without"} onAdd).
      </p>
    </section>
  );
};

export default ProductDetailPanel;
