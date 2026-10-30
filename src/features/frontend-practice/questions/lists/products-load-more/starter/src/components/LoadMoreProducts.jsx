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
import { useEffect, useState } from "react";
import api from "../api/axios";

const LoadMoreProducts = ({ category = "all", pageSize = 4 }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { category, page, limit: pageSize } });
      setItems((prev) => [...prev, ...data.products]);
      setPage(page + 1);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("Failed to load products", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
  }, []);

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

      <div className="mt-4 flex justify-center" aria-live="polite">
        <button
          onClick={loadMore}
          className="rounded-full bg-app-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      </div>
    </section>
  );
};

export default LoadMoreProducts;
