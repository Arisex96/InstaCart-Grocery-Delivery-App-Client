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

  useEffect(() => {
    let isMounted = true;
    setFetching(true);

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", { params: { category } });
        if (isMounted) {
          const mapped = response.data.products.map((p) => ({
            _id: p._id,
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
          setFetching(false);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [category]);

  if (fetching) {
    return (
      <p role="status" className="py-10 text-center text-sm text-app-text-light">
        Loading products…
      </p>
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
