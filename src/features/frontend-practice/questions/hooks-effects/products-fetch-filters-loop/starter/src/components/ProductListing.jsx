// src/components/ProductListing.jsx — the data-fetching part of the Products page
// (modelled on client/src/pages/Products.tsx): filters -> api.get("/products", { params }) ->
// loading / error / list. The backend dashboard shows this tab sending requests nonstop.
//
// Props: category ("all" or a category slug) and maxPrice ("" or a number string).
import { useEffect, useState } from "react";
import api from "../api/axios";

const ProductListing = ({ category = "all", maxPrice = "" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The exact params the real Products page sends.
  const filters = { category, minPrice: "", maxPrice, sort: "default" };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", { params: filters });
        if (isMounted) {
          // The API sends `id`; the app works with `_id`.
          setProducts(response.data.products.map((p) => ({ _id: p.id, name: p.name, price: p.price, unit: p.unit })));
        }
      } catch (err) {
        console.error("Failed to load products", err);
        if (isMounted) setError("Failed to load products");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return (
    <section className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-app-border pb-2">
        <h2 className="font-serif text-lg font-bold text-app-green">
          {category === "all" ? "All Products" : category}
        </h2>
        <p className="text-xs text-app-text-light">
          {loading ? "Loading…" : `${products.length} ${products.length === 1 ? "result" : "results"}`}
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-app-error">{error}</p>}

      <ul className="mt-3 grid gap-2">
        {products.map((product) => (
          <li key={product._id} className="flex items-center justify-between rounded-xl bg-app-cream px-3 py-2 text-sm">
            <span className="font-medium text-app-text">{product.name}</span>
            <span className="text-app-green">
              ${product.price.toFixed(2)} <span className="text-xs text-app-text-light">/ {product.unit}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductListing;
