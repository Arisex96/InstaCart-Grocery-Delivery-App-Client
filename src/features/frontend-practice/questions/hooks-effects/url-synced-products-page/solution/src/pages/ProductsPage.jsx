// src/pages/ProductsPage.jsx — the Products page, rebuilt so the URL holds the filters.
// (Real version: client/src/pages/Products.tsx. Search box pattern: client/src/components/Navbar.tsx.)
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import api from "../api/axios";
import useDebounce from "../hooks/useDebounce";
import { categories } from "../data/products";
import Pagination from "../components/Pagination";

const SORTS = [
  ["default", "Default"],
  ["price-low", "Price: low to high"],
  ["price-high", "Price: high to low"],
];

/** Copy of the params with `changes` applied; null/""/undefined removes a key (defaults stay out of the URL). */
function withParams(current, changes) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  return next;
}

const ProductsPage = ({ debounceMs = 300, pageSize = 6 }) => {
  const [params, setParams] = useSearchParams();

  // APPROACH: the URL is the single source of truth, so everything is DERIVED from it on every
  // render. Copying it into useState would make Back/Forward fight our own updates.
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "default";
  const urlSearch = params.get("search") ?? "";
  const parsedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const requestedPage = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  // ---- search box: the only local state, so typing stays instant ----
  const [text, setText] = useState(urlSearch);
  const debouncedText = useDebounce(text, debounceMs);
  // The last search value this component wrote to (or read from) the URL.
  const lastSynced = useRef(urlSearch);

  // URL -> box: only when the URL changed for a reason other than our own write (Back/Forward, links).
  useEffect(() => {
    if (urlSearch !== lastSynced.current) {
      lastSynced.current = urlSearch;
      setText(urlSearch);
    }
  }, [urlSearch]);

  // TRAP: setSearchParams changes identity whenever the URL changes. If it were a dependency of the
  // effect below, every Back/Forward would re-run it and write the OLD debounced text back into the
  // URL. Keep the latest function in a ref and depend on the debounced text only.
  const setParamsRef = useRef(setParams);
  useEffect(() => {
    setParamsRef.current = setParams;
  });

  // box -> URL: after the typing pause, REPLACE the entry (no history spam) and reset the page.
  useEffect(() => {
    if (debouncedText === lastSynced.current) return;
    lastSynced.current = debouncedText;
    setParamsRef.current((prev) => withParams(prev, { search: debouncedText.trim() ? debouncedText : null, page: null }), {
      replace: true,
    });
  }, [debouncedText]);

  // ---- data: one status value drives every state ----
  const [state, setState] = useState({ status: "loading", products: [], key: "" });
  // The data belongs to the query it was loaded for. After Back/Forward the URL changes one render
  // BEFORE the fetch effect runs, so without this check we would briefly treat the previous query's
  // results as the new one (and e.g. clamp the page against the wrong total).
  const queryKey = JSON.stringify([category, urlSearch, sort]);
  const status = state.key === queryKey ? state.status : "loading";
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // ROOT TRAP: an older, slower request must never overwrite newer results. Each run owns an
    // `ignore` flag that the cleanup flips before the next run starts.
    let ignore = false;
    setState({ status: "loading", products: [], key: queryKey });
    api
      .get("/products", { params: { category, search: urlSearch, sort } })
      .then(({ data }) => {
        if (!ignore) setState({ status: "success", products: data.products, key: queryKey });
      })
      .catch(() => {
        if (!ignore) setState({ status: "error", products: [], key: queryKey });
      });
    return () => {
      ignore = true;
    };
  }, [category, urlSearch, sort, queryKey, attempt]);

  // ---- pagination is derived from the loaded result ----
  const total = status === "success" ? state.products.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const visible = state.products.slice((page - 1) * pageSize, page * pageSize);

  // A page beyond the last one is corrected in the URL (replace), once we know how many pages exist.
  useEffect(() => {
    if (status === "success" && requestedPage > totalPages) {
      setParams((prev) => withParams(prev, { page: totalPages > 1 ? totalPages : null }), { replace: true });
    }
  }, [status, requestedPage, totalPages, setParams]);

  // category / sort / page are navigation-like: PUSH an entry, and reset the page on filter changes.
  const changeCategory = (value) => setParams(withParams(params, { category: value === "all" ? null : value, page: null }));
  const changeSort = (value) => setParams(withParams(params, { sort: value === "default" ? null : value, page: null }));
  const changePage = (value) => setParams(withParams(params, { page: value > 1 ? value : null }));

  const field = "rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-text focus:border-app-green";

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h1 className="font-serif text-3xl text-app-green">Products</h1>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1">
          <label htmlFor="products-search" className="sr-only">
            Search products
          </label>
          <SearchIcon className="absolute left-3 top-2.5 size-4 text-app-text-light" aria-hidden="true" />
          <input
            id="products-search"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search for groceries..."
            className={`${field} w-full rounded-full bg-app-cream pl-9`}
          />
        </div>
        <div>
          <label htmlFor="products-category" className="mb-1 block text-xs font-semibold uppercase text-app-text-light">
            Category
          </label>
          <select id="products-category" value={category} onChange={(e) => changeCategory(e.target.value)} className={field}>
            <option value="all">All products</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="products-sort" className="mb-1 block text-xs font-semibold uppercase text-app-text-light">
            Sort by
          </label>
          <select id="products-sort" value={sort} onChange={(e) => changeSort(e.target.value)} className={field}>
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        {status === "loading" && (
          <>
            <p role="status" className="text-sm text-app-text-light">
              Loading products…
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3" aria-hidden="true">
              {Array.from({ length: pageSize }, (_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-app-cream-dark" />
              ))}
            </div>
          </>
        )}

        {status === "error" && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-semibold">Could not load products</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-2 rounded-full bg-app-green px-4 py-1.5 text-xs font-semibold text-white hover:bg-app-green-light"
            >
              Try again
            </button>
          </div>
        )}

        {status === "success" && total === 0 && (
          <p className="rounded-2xl border border-dashed border-app-border bg-app-cream/50 p-8 text-center text-sm text-app-text-light">
            No products found
          </p>
        )}

        {status === "success" && total > 0 && (
          <>
            <p className="mb-3 text-sm text-app-text-light">
              {total} {total === 1 ? "product" : "products"}
            </p>
            <ul aria-label="Products" className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {visible.map((product) => (
                <li key={product.id} className="flex items-center gap-3 rounded-2xl border border-app-border bg-white p-3">
                  <img src={product.image} alt="" className="size-14 shrink-0 rounded-xl bg-app-cream object-contain" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-app-text">{product.name}</span>
                    <span className="text-sm font-semibold text-app-green">${product.price.toFixed(2)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
          </>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
