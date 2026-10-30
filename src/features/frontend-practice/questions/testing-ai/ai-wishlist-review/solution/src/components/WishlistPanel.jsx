// src/components/WishlistPanel.jsx — reviewed and fixed version of the AI-generated panel.
import { Trash2 } from "lucide-react";

const WishlistPanel = ({ products, onRemove }) => {
  // FIX 5 (missing state): the original returned null, so an empty wishlist showed nothing.
  if (products.length === 0) {
    return (
      <section aria-label="Wishlist" className="rounded-2xl border border-dashed border-app-border bg-white p-4 text-center">
        <p className="text-sm text-app-text-light">Your wishlist is empty</p>
      </section>
    );
  }

  // FIX 3 (hallucinated API): `Array.prototype.sortBy` does not exist (it is a lodash/Ruby idea),
  // so this threw a TypeError. Sort a COPY with sort() + localeCompare; sort() alone would also
  // reorder the caller's array.
  const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section aria-label="Wishlist" className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-serif text-lg font-bold text-app-green">Your wishlist</h2>
      <ul className="flex flex-col gap-2">
        {sorted.map((product) => (
          <li key={product._id} className="flex items-center justify-between rounded-xl bg-app-cream px-3 py-2">
            <span className="text-sm font-medium text-app-text">
              {product.name} <span className="text-xs text-app-text-light">${product.price.toFixed(2)}</span>
            </span>
            <button
              onClick={() => onRemove(product._id)}
              aria-label={"Remove " + product.name + " from wishlist"}
              className="rounded-full p-1.5 text-app-text-light hover:bg-white hover:text-app-error"
            >
              {/* FIX 4 (hallucinated icon): lucide-react has no `HeartOff`; importing it gives
                  `undefined` and React throws "Element type is invalid". Trash2 exists. */}
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default WishlistPanel;
