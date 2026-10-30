// src/Demo.jsx — read-only. The live preview renders this file's default export,
// so you can see your ProductCard the way the Products page would.
// (The preview already provides a router and a toast host.)
import ProductCard from "./components/ProductCard";
import useCartStore from "./store/useCartStore";
import { products } from "./data/products";

// bananas (no discount, plenty of stock), milk (20% off, 3 left),
// avocados (sold out), chocolate (10% off, 5 left)
const featured = [products[0], products[1], products[2], products[8]];

export default function Demo() {
  const totalItems = useCartStore((state) => state.total_items);

  return (
    <div>
      <p className="mb-3 text-sm text-app-text-light">
        Items in cart: <span className="font-bold text-app-green">{totalItems}</span>
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
