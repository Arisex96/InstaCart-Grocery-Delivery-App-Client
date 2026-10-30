// src/Demo.jsx — read-only. The live preview renders this file's default export inside an in-memory
// router. The two buttons below behave like a link / the Back button: they change the URL from outside
// the page, which the hook must notice.
import { useNavigate } from "react-router-dom";
import ProductsPage from "./components/ProductsPage";
import { products } from "./data/products";

export default function Demo() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-sm">
        <button onClick={() => navigate("/products?category=beverages")} className="rounded-full border border-app-border bg-white px-3 py-1">
          Go to Beverages
        </button>
        <button onClick={() => navigate(-1)} className="rounded-full border border-app-border bg-white px-3 py-1">
          Simulate Back
        </button>
      </div>
      <ProductsPage products={products} />
    </div>
  );
}
