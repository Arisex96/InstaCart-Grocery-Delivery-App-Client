// src/Demo.jsx — read-only. The live preview renders this file's default export.
import { memo, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "./hooks/useWishlist";
import { products as catalogue } from "./data/products";

const shown = catalogue.slice(0, 8);

// Rows are memoised like the real product grid; they only see the `saved` boolean and `onToggle`.
const Row = memo(function Row({ product, saved, onToggle }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-app-cream px-3 py-2 text-sm">
      <span>
        {product.name} · ${product.price.toFixed(2)}
      </span>
      <button
        aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`}
        aria-pressed={saved}
        onClick={() => onToggle(product._id)}
        className="rounded-full p-1"
      >
        <Heart className={`size-5 ${saved ? "fill-red-500 text-red-500" : "text-zinc-400"}`} />
      </button>
    </li>
  );
});

export default function Demo() {
  const [products, setProducts] = useState(shown);
  const wishlist = useWishlist(products);
  const bakery = products.filter((p) => p.category === "bakery");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-app-border bg-white p-4">
        <h3 className="mb-3 font-serif text-lg text-app-green">Products</h3>
        <ul className="flex flex-col gap-2">
          {products.map((p) => (
            <Row key={p._id} product={p} saved={wishlist.has(p._id)} onToggle={wishlist.toggle} />
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-app-border bg-white p-4">
        <h3 className="mb-3 font-serif text-lg text-app-green">Saved items</h3>
        <p className="mb-2 text-sm">
          Saved: <b>{wishlist.count}</b> · Total: <b>${wishlist.totalPrice.toFixed(2)}</b>
        </p>
        <ul className="mb-3 list-disc pl-5 text-sm">
          {wishlist.items.map((p) => (
            <li key={p._id}>{p.name}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => bakery.forEach((p) => !wishlist.has(p._id) && wishlist.toggle(p._id))}
            className="rounded-full bg-app-green px-3 py-1.5 text-xs font-semibold text-white"
          >
            Save all bakery items
          </button>
          <button
            onClick={() => setProducts((list) => list.map((p) => ({ ...p, price: Math.round(p.price * 110) / 100 })))}
            className="rounded-full border border-app-border px-3 py-1.5 text-xs font-semibold"
          >
            Reprice the catalogue (+10%)
          </button>
          <button onClick={wishlist.clear} className="rounded-full border border-app-border px-3 py-1.5 text-xs">
            Clear
          </button>
        </div>
      </section>
    </div>
  );
}
