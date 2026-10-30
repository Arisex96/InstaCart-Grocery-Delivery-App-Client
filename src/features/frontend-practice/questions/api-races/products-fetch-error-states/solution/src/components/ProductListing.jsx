// src/components/ProductListing.jsx — the data-loading half of client/src/pages/Products.tsx.
// Shows the product grid for a category. Reported on mobile networks (request fails / times out).
//
// The API answers like the real server: { data: { products: [{ id, name, price, ... }] } }
// (note: the server field is `id`; the client Product type uses `_id`).
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "./ProductCard";

const ProductListing = ({ category = "all" }) => {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  // FIX (error state): the catch block used to only log, so the UI had nothing to show.
  const [error, setError] = useState(null);
  // FIX (retry): bumping this re-runs the effect without changing the category.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setFetching(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", { params: { category } });
        if (isMounted) {
          const mapped = response.data.products.map((p) => ({
            // ROOT CAUSE (ids): the server sends `id`; reading `p._id` produced `undefined`,
            // so different products shared an id and merged into one cart line.
            _id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            image: p.image,
            category: p.category,
            unit: p.unit,
            stock: p.stock,
            isOrganic: p.isOrganic,
            rating: p.rating,
            reviewCount: p.reviewCount,
            discount: p.discount,
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load products", err);
        if (isMounted) setError("Couldn't load products. Please try again.");
      } finally {
        // ROOT CAUSE (stuck loader): setFetching(false) lived at the end of the success path,
        // so a throw skipped it. FIX: `finally` runs on both paths (still guarded by isMounted).
        if (isMounted) setFetching(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [category, reloadKey]);

  if (fetching) {
    return (
      <p role="status" className="py-10 text-center text-sm text-app-text-light">
        Loading products…
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="mb-3 text-sm font-semibold text-app-error">{error}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-full bg-app-green px-6 py-2.5 font-semibold text-white shadow-md hover:bg-app-green-light active:scale-95"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center">
        <h3 className="mb-1 font-serif text-xl font-bold text-app-green">No products found</h3>
        <p className="text-sm text-zinc-500">Try another category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductListing;
