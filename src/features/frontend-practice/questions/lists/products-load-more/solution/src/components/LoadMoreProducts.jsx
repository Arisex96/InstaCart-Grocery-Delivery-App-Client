// src/components/LoadMoreProducts.jsx — paged product list for the Products page.
//
// Props
//   category   slug or "all". When it changes the list must start over.
//   pageSize   products per request
//
// API (see src/api/axios.js, same call shape as client/src/pages/Products.tsx):
//   api.get("/products", { params: { category, page, limit } })
//     -> { data: { products: [{ id, name, price, ... }], hasMore: boolean } }
//
// Beta feedback: duplicate products on fast clicks, old category products in the new list,
// the button never goes away, and nothing happens when the network fails.
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";

const LoadMoreProducts = ({ category = "all", pageSize = 4 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // ROOT CAUSE (duplicates): the old loadMore read `page`/`loading` from the render it was
  // created in, so two clicks before the next render both asked for page 2. State is only
  // visible on the NEXT render. FIX: what a handler must see right now lives in refs.
  const inFlight = useRef(false);
  const nextPage = useRef(1);
  // ROOT CAUSE (race): nothing tied a response to the category it was requested for.
  // FIX: every reset bumps a generation; results from an older generation are dropped.
  const generation = useRef(0);

  const loadMore = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const mine = generation.current;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/products", { params: { category, page: nextPage.current, limit: pageSize } });
      if (mine !== generation.current) return; // outdated category: ignore
      // Skip ids we already have, as a second line of defence.
      setItems((prev) => {
        const known = new Set(prev.map((p) => p.id));
        return [...prev, ...data.products.filter((p) => !known.has(p.id))];
      });
      nextPage.current += 1; // advance the cursor only after the page really arrived
      setHasMore(data.hasMore);
    } catch (err) {
      if (mine !== generation.current) return;
      console.error("Failed to load products", err);
      setError("Could not load more products."); // nextPage is unchanged, so Retry repeats the page
    } finally {
      // The newer generation owns the flags now; a stale request must not touch them.
      if (mine === generation.current) {
        inFlight.current = false;
        setLoading(false);
      }
    }
  }, [category, pageSize]);

  // FIX (category change): reset everything and start over. It re-runs whenever `loadMore`
  // changes, which happens exactly when category or pageSize change.
  useEffect(() => {
    generation.current += 1;
    inFlight.current = false;
    nextPage.current = 1;
    setItems([]);
    setHasMore(true);
    setError(null);
    loadMore();
  }, [loadMore]);

  return (
    <section className="max-w-xl">
      <ul className="grid grid-cols-2 gap-3">
        {items.map((product) => (
          <li key={product.id} className="rounded-xl border border-app-border bg-white p-3">
            <p className="text-sm font-bold text-app-text">{product.name}</p>
            <p className="text-xs text-app-text-light">{product.category}</p>
            <p className="text-sm text-app-green">${product.price.toFixed(2)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col items-center gap-2" aria-live="polite">
        {error && (
          <p role="alert" className="text-sm text-app-error">
            {error}
          </p>
        )}
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full bg-app-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-60"
          >
            {loading ? "Loading…" : error ? "Retry" : "Load more"}
          </button>
        ) : (
          <p className="text-sm text-app-text-light">No more products</p>
        )}
      </div>
    </section>
  );
};

export default LoadMoreProducts;
