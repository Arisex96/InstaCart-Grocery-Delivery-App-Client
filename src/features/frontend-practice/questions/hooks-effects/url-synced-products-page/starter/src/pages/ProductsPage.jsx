// src/pages/ProductsPage.jsx — the Products page, rebuilt so the URL holds the filters.
// (Real version: client/src/pages/Products.tsx. Search box pattern: client/src/components/Navbar.tsx.)
//
// Props
//   debounceMs  pause after typing before the search is written to the URL (default 300)
//   pageSize    products per page (default 6)
//
// Imports you will probably need:
//   import { useSearchParams } from "react-router-dom";
//   import api from "../api/axios";                 // api.get("/products", { params: { category, search, sort } })
//   import useDebounce from "../hooks/useDebounce";
//   import { categories } from "../data/products";  // [{ slug, name }]
//   import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router-dom";

const ProductsPage = ({ debounceMs = 300, pageSize = 6 }) => {
  const [params] = useSearchParams();

  // TODO 1: derive category / search / sort / page from `params` (defaults: "all", "", "default", 1).
  // TODO 2: load the products whenever category, search or sort change (ignore stale responses).
  // TODO 3: render the loading / error (Try again) / empty / success states from the UI requirements.
  // TODO 4: filter bar: search box (debounced, replaces history), category + sort selects (push history).
  // TODO 5: client-side pagination with <Pagination /> (reset to page 1 on any filter change).

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h1 className="font-serif text-2xl text-app-green">Products</h1>
      <p className="mt-2 text-sm text-app-text-light">
        Not built yet. Current query string: {params.toString() || "(none)"} · {pageSize} per page · {debounceMs} ms debounce
      </p>
    </section>
  );
};

export default ProductsPage;
