// src/components/ProductDetails.jsx — trimmed copy of how client/src/pages/ProductPage.tsx loads a product
// together with its reviews. The id is a prop here so tests and the preview can change it.
//
// api.get("/products/:id")   -> { data: { product } }
// reviewsApi.list(productId) -> [{ id, author, rating, comment }]   (see src/api/reviewsApi.js)
//
// Reported: "wrong reviews under the new product" and "reviews outage takes the whole page down".
import { useEffect, useState } from "react";
import { StarIcon } from "lucide-react";
import api from "../api/axios";
import reviewsApi from "../api/reviewsApi";

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data.product);
        const list = await reviewsApi.list(productId);
        setReviews(list);
      } catch (err) {
        console.error("Failed to load product page", err);
        setError("Could not load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  if (loading) return <p className="text-sm text-app-text-light">Loading product…</p>;
  if (error) return <p className="text-sm text-app-error">{error}</p>;
  if (!product) return null;

  return (
    <article className="max-w-md rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <h2 className="font-serif text-2xl text-app-green">{product.name}</h2>
      <p className="text-sm text-app-text-light">{product.description}</p>
      <p className="mt-2 text-lg font-bold text-app-green">${product.price.toFixed(2)}</p>

      <section className="mt-4 border-t border-app-cream-dark pt-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Reviews</h3>
        {reviews.length === 0 && <p className="mt-2 text-sm text-app-text-light">No reviews yet</p>}
        <ul className="mt-2 space-y-2">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg bg-app-cream p-3 text-sm">
              <div className="flex items-center gap-1">
                <StarIcon className="size-4 text-app-warning fill-app-warning" />
                <span className="font-semibold">{review.rating}</span>
                <span className="text-app-text-light">· {review.author}</span>
              </div>
              <p className="mt-1">{review.comment}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default ProductDetails;
