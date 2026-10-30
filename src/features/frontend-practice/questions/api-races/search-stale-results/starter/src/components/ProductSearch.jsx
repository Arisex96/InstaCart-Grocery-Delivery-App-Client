// src/components/ProductSearch.jsx — a search box that follows the Products page pattern:
// debounced query -> effect -> api.get("/products", { params }) -> loading / error / results.
//
// `debounceMs` is a prop so tests (and the preview) can shorten it.
// The fake api lives in src/api/axios.js: it answers like the real server ({ data: { products } })
// but you can slow individual queries down with api.__configure({ latencyFor }).
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";

const ProductSearch = ({ debounceMs = 300 }) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, debounceMs);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products", { params: { search: debouncedQuery } });
        setProducts(data.products);
        setError(null);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Could not load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedQuery]);

  return (
    <div className="max-w-md rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <label htmlFor="product-search" className="sr-only">
        Search products
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-app-text-light" />
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for groceries..."
          className="w-full rounded-full border border-app-border bg-app-cream py-2 pl-9 pr-4 text-sm"
        />
      </div>

      <div className="mt-3 min-h-[2rem] text-sm" aria-live="polite">
        {loading && <p className="text-app-text-light">Searching…</p>}
        {error && !loading && <p className="text-app-error">{error}</p>}
        {!loading && !error && query.trim() && products.length === 0 && (
          <p className="text-app-text-light">No products found</p>
        )}
      </div>

      <ul className="mt-1 flex flex-col gap-1">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between rounded-lg bg-app-cream px-3 py-2">
            <span className="font-medium text-app-text">{product.name}</span>
            <span className="text-app-green">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSearch;
