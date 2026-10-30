// src/components/ProductsListing.jsx — the product section of the Products page
// (modelled on client/src/pages/Products.tsx and client/src/components/ProductGrid.tsx).
//
// Props
//   initialCategory   category slug to start with, default "all"
import { useEffect, useState } from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import api from "../api/axios";
import { categories } from "../data/products";

const money = (n) => "$" + n.toFixed(2);

// APPROACH: one `state` object ({ status, products }) so the UI can never be "not loading, not empty
// and not successful" at the same time. Every UI state is derived from `status`.
const ProductsListing = ({ initialCategory = "all" }) => {
  const [category, setCategory] = useState(initialCategory);
  const [attempt, setAttempt] = useState(0); // bumped by Retry / Clear filters to run the effect again
  const [state, setState] = useState({ status: "loading", products: [] });

  useEffect(() => {
    // Each run owns an `ignore` flag. The cleanup flips it before the next run, so a slow response for
    // an older category can never overwrite newer data.
    let ignore = false;
    setState({ status: "loading", products: [] });
    api
      .get("/products", { params: { category } })
      .then(({ data }) => {
        if (ignore) return;
        // The server sends `id`; the app's components use `_id`.
        setState({ status: "success", products: data.products.map((p) => ({ ...p, _id: p.id })) });
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Failed to load products", err);
        setState({ status: "error", products: [] });
      });
    return () => {
      ignore = true;
    };
  }, [category, attempt]);

  const clearFilters = () => (category === "all" ? setAttempt((n) => n + 1) : setCategory("all"));
  const { status, products } = state;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border pb-4">
        <h2 className="font-serif text-2xl text-app-green">Products</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm font-medium text-app-text-light">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-app-border bg-white px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">All products</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4">
        {status === "loading" && (
          <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} aria-hidden="true" className="animate-pulse rounded-2xl border border-app-border p-3">
                <div className="h-24 rounded-xl bg-app-cream-dark" />
                <div className="mt-3 h-3 w-3/4 rounded bg-app-cream-dark" />
                <div className="mt-2 h-3 w-1/3 rounded bg-app-cream-dark" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-4 py-10 text-center">
            <AlertCircle className="size-10 text-app-error" />
            <p className="font-semibold text-app-text">Could not load products</p>
            <button
              onClick={() => setAttempt((n) => n + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-app-green px-5 py-2 text-sm font-semibold text-white hover:bg-app-green-light"
            >
              <RefreshCw className="size-4" /> Retry
            </button>
          </div>
        )}

        {status === "success" && products.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center">
            <Inbox className="size-12 text-gray-400" />
            <h3 className="font-serif text-xl font-bold text-app-green">No products found</h3>
            <button
              onClick={clearFilters}
              className="rounded-full bg-app-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-app-green-light"
            >
              Clear filters
            </button>
          </div>
        )}

        {status === "success" && products.length > 0 && (
          <>
            <p className="mb-3 text-sm text-app-text-light">
              Showing {products.length} {products.length === 1 ? "product" : "products"}
            </p>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((p) => {
                const discounted = p.discount > 0 && p.originalPrice > p.price;
                return (
                  <li key={p._id} className="relative flex flex-col gap-2 rounded-2xl border border-app-border p-3">
                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                      {p.discount > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          {p.discount}% OFF
                        </span>
                      )}
                      {p.stock === 0 && (
                        <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-white">
                          Out of stock
                        </span>
                      )}
                    </div>
                    <div className={`flex h-24 items-center justify-center rounded-xl bg-app-cream/40 ${p.stock === 0 ? "opacity-50" : ""}`}>
                      <img src={p.image} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <h3 className="line-clamp-1 text-sm font-bold text-app-text">{p.name}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-app-green">{money(p.price)}</span>
                      {discounted && <del className="text-xs text-zinc-400">{money(p.originalPrice)}</del>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductsListing;
