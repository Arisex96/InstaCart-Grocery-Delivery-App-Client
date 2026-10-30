// src/Demo.jsx — read-only. The live preview renders this file's default export.
// One saved-ids state is shared by every card and by the header counter.
import { useState } from "react";
import WishlistButton from "./components/WishlistButton";
import WishlistCount from "./components/WishlistCount";
import { products } from "./data/products";

export default function Demo() {
  const [savedIds, setSavedIds] = useState(["p1"]);
  const toggle = (id) => setSavedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-serif text-xl text-app-green">Fresh picks</h1>
        <span className="ml-auto">
          <WishlistCount savedIds={savedIds} />
        </span>
        <button
          onClick={() => setSavedIds(products.map((p) => p._id))}
          className="rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold"
        >
          Save all
        </button>
        <button
          onClick={() => setSavedIds([...savedIds, savedIds[0] ?? "p1"])}
          className="rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold"
        >
          Add a duplicate id
        </button>
        <button onClick={() => setSavedIds([])} className="rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold">
          Clear
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          // The card is clickable, like the real ProductCard: the heart must not trigger this.
          <div
            key={product._id}
            onClick={() => console.log("Card opened:", product.name)}
            className="relative cursor-pointer rounded-2xl border border-app-border bg-white p-3"
          >
            <div className="absolute right-2 top-2">
              <WishlistButton product={product} isSaved={savedIds.includes(product._id)} onToggle={toggle} />
            </div>
            <img src={product.image} alt="" className="h-20 w-full object-contain" />
            <p className="mt-2 text-sm font-bold text-app-text">{product.name}</p>
            <p className="text-xs text-app-text-light">${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
