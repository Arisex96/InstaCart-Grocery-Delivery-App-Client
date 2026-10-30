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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", { params: { category } });
        if (isMounted) {
          setProducts(response.data.products.map(mapProduct));
        }
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [category]);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-serif font-bold text-app-green">Products</h1>

      {products.length === 0 ? (
        <div className="w-full rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-4 py-16 text-center">
          <h3 className="mb-2 font-serif text-xl font-bold text-app-green">No products found</h3>
          <p className="text-sm text-app-text-light">Try another category.</p>
        </div>
      ) : (
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
