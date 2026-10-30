// src/components/ProductsListing.jsx — the product section of the Products page
// (modelled on client/src/pages/Products.tsx and client/src/components/ProductGrid.tsx).
//
// Props
//   initialCategory   category slug to start with, default "all"
//
// Data
//   const { data } = await api.get("/products", { params: { category } });
//   data.products -> [{ id, name, price, originalPrice, discount, stock, category, ... }]
//   (note: the server sends `id`; the app's cards use `_id`). Categories come from src/data/products.js.
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) lets you make the
// fake server slow, failing or empty, and the "Target UI" output tab shows the finished design.
import { useState } from "react";
// import api from "../api/axios";
// import { categories } from "../data/products";

const ProductsListing = ({ initialCategory = "all" }) => {
  const [category, setCategory] = useState(initialCategory);

  // TODO: keep ONE status ("loading" | "error" | "success") and the products in state.
  // TODO: fetch with api.get("/products", { params: { category } }) in an effect.
  //       Ignore responses that belong to an older category (cleanup flag).
  // TODO: a retry counter so "Retry" can run the same request again.

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-2xl text-app-green">Products</h2>
      <p className="mt-3 text-sm text-app-text-light">Not built yet (category: {category}).</p>
      {/* TODO: category <select>, loading / error / empty / success states */}
      <button className="hidden" onClick={() => setCategory("all")}>
        reset
      </button>
    </section>
  );
};

export default ProductsListing;
