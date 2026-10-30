// src/pages/ProductsPage.jsx — modelled on the fetch effect in client/src/pages/Products.tsx.
// `category` comes from the URL (?category=bakery); "all" means no filter.
//
// Reported by QA on a throttled connection: the page opens on "No products found", errors
// look the same as an empty catalogue, and changing category appears to do nothing for a while.
// The api server sends `id`; the app maps it to `_id` (see mapProduct).
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const mapProduct = ({ id, ...rest }) => ({ _id: id, ...rest });

const ProductsPage = ({ category = "all" }) => {
  // ROOT CAUSE: only `products` and a `loading` flag that was never set to true existed, and
  // errors were swallowed. "Empty list" had to double as loading, error and "nothing yet".
  // FIX: one `status` says which UI to show; `attempt` lets Retry re-run the effect.
  const [status, setStatus] = useState("loading"); // "loading" | "error" | "success"
  const [products, setProducts] = useState([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    // FIX: every new request (first load, category change, retry) starts from a clean loading state,
    // so the previous category's list is hidden instead of lingering.
    setStatus("loading");
    setProducts([]);

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", { params: { category } });
        if (!isMounted) return; // a response for an older category must not win
        setProducts(response.data.products.map(mapProduct));
        setStatus("success");
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to load products", error);
        setStatus("error");
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [category, attempt]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-serif font-bold text-app-green">Products</h1>

      {status === "loading" && (
        <p role="status" aria-busy="true" className="py-16 text-center text-app-text-light">
          Loading products…
        </p>
      )}

      {status === "error" && (
        <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-4 py-12 text-center">
          <p className="mb-3 font-semibold text-app-error">We couldn't load products.</p>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="rounded-full bg-app-green px-6 py-2.5 font-semibold text-white shadow-md hover:bg-app-green-light active:scale-95"
          >
            Retry
          </button>
        </div>
      )}

      {status === "success" && products.length === 0 && (
        <div className="w-full rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-4 py-16 text-center">
          <h3 className="mb-2 font-serif text-xl font-bold text-app-green">No products found</h3>
          <p className="text-sm text-app-text-light">Try another category.</p>
        </div>
      )}

      {status === "success" && products.length > 0 && (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
