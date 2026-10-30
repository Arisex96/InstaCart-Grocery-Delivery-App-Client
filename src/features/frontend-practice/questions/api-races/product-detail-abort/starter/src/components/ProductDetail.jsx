// src/components/ProductDetail.jsx — trimmed copy of the loading logic in client/src/pages/ProductPage.tsx.
// The real page reads the id from the URL; here it is a prop so tests and the preview can change it.
//
// The fake api (src/api/axios.js) mirrors axios: api.get(url, { signal }) rejects with a
// CanceledError (name "CanceledError", code "ERR_CANCELED") when the signal is aborted.
//
// Reported: "I clicked a product, then another one, and the page showed the first product again."
import { useEffect, useState } from "react";
import api from "../api/axios";

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadProduct = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data.product);
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Could not load product");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  if (loading) return <p className="text-sm text-app-text-light">Loading product…</p>;
  if (error) return <p className="text-sm text-app-error">{error}</p>;
  if (!product) return null;

  return (
    <article className="max-w-sm rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <img src={product.image} alt={product.name} className="mx-auto h-28 w-28 object-contain" />
      <h2 className="mt-3 font-serif text-2xl text-app-green">{product.name}</h2>
      <p className="mt-1 text-sm text-app-text-light">{product.description}</p>
      <p className="mt-3 text-lg font-bold text-app-green">${product.price.toFixed(2)}</p>
      <p className="text-xs text-app-text-light">{product.stock} in stock</p>
    </article>
  );
};

export default ProductDetail;
