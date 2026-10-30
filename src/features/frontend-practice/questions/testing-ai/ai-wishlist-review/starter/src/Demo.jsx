// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The fake server answers wishlist syncs after 400 ms, except for the avocados (p3): it rejects
// those with a 500 so you can see what happens when a sync fails. Watch the Console tab.
import useWishlist from "./hooks/useWishlist";
import WishlistButton from "./components/WishlistButton";
import WishlistPanel from "./components/WishlistPanel";
import api from "./api/axios";
import { products } from "./data/products";

api.put = async (url) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (url.endsWith("/p3")) {
    const error = new Error("Request failed with status code 500");
    error.response = { status: 500 };
    throw error;
  }
  return { data: {} };
};

const shown = [products[0], products[1], products[2], products[8]];

export default function Demo() {
  const wishlist = useWishlist();

  return (
    <div className="space-y-4">
      <p className="text-sm text-app-text-light">
        Wishlist items: <b className="text-app-green">{wishlist.count}</b>
      </p>
      <ul className="grid grid-cols-2 gap-3">
        {shown.map((product) => (
          <li key={product._id} className="flex items-center justify-between rounded-xl border border-app-border bg-white p-3">
            <span className="text-sm font-medium">{product.name}</span>
            <WishlistButton product={product} wished={wishlist.isWished(product._id)} onToggle={wishlist.toggle} />
          </li>
        ))}
      </ul>
      {wishlist.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-app-error">
          {wishlist.error}
        </p>
      )}
      <WishlistPanel products={wishlist.wishedProducts} onRemove={wishlist.toggle} />
    </div>
  );
}
