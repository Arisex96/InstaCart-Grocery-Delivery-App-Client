// src/components/AdminProductsTable.jsx — the product table of the admin dashboard
// (client/src/pages/admin/AdminProducts.tsx is the real page).
//
// Props
//   products        [{ _id, name, category, price, stock }]
//   onStockChange   (id, newStock) => void        an inline stock edit was saved
//   onBulkUpdate    (ids) => void                  "Mark out of stock" for the selected products
//   pageSize        rows per page (default 5)
import { useEffect, useRef, useState } from "react";
import StockCell from "./StockCell";
import { categories } from "../data/products";
import { PAGE_SIZE, filterProducts, nextSort, pageCount, paginate, sortProducts, stockStatus } from "../lib/tableUtils";

const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name ?? slug;

const SORTABLE = [
  { key: "name", label: "Name" },
  { key: "price", label: "Price" },
  { key: "stock", label: "Stock" },
];

const AdminProductsTable = ({ products, onStockChange, onBulkUpdate, pageSize = PAGE_SIZE }) => {
  // APPROACH: state is only what the user controls (query, sort, page, selected ids). The rows on
  // screen are derived: products -> filter -> sort -> paginate, on every render.
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set()); // ids, NOT row indexes: survives paging/sorting

  const filtered = filterProducts(products, query);
  const sorted = sortProducts(filtered, sort);
  const pages = pageCount(sorted.length, pageSize);
  const current = Math.min(page, pages); // clamp: the list can shrink under the user (search, new props)
  const rows = paginate(sorted, current, pageSize);

  const pageIds = rows.map((p) => p._id);
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length;
  const allOnPage = rows.length > 0 && selectedOnPage === rows.length;
  const selectedIds = products.filter((p) => selected.has(p._id)).map((p) => p._id); // prop order

  const headerCheckbox = useRef(null);
  useEffect(() => {
    // `indeterminate` is a DOM property, not an attribute, so it has to be set imperatively.
    if (headerCheckbox.current) headerCheckbox.current.indeterminate = selectedOnPage > 0 && !allOnPage;
  });

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev); // never mutate the previous Set
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const togglePage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of pageIds) {
        if (allOnPage) next.delete(id);
        else next.add(id);
      }
      return next;
    });

  const ariaSort = (key) => (sort?.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none");

  const from = sorted.length === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, sorted.length);

  return (
    <section className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl text-app-green">Products</h2>
        <input
          type="search"
          aria-label="Search products"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="w-64 max-w-full rounded-full border border-app-border bg-app-cream px-4 py-2 text-sm"
        />
      </div>

      {selectedIds.length > 0 && (
        <div role="status" className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-app-green px-4 py-2 text-sm text-white">
          <span className="font-semibold">{selectedIds.length} selected</span>
          <button
            onClick={() => {
              onBulkUpdate(selectedIds);
              setSelected(new Set());
            }}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-app-green"
          >
            Mark out of stock
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs underline">
            Clear selection
          </button>
        </div>
      )}

      <div className="mt-3 overflow-x-auto">
        <table aria-label="Products" className="w-full text-left text-sm">
          <thead className="border-b border-app-border text-xs uppercase tracking-wide text-app-text-light">
            <tr>
              <th scope="col" className="w-10 py-2">
                <input
                  ref={headerCheckbox}
                  type="checkbox"
                  aria-label="Select all on this page"
                  checked={allOnPage}
                  onChange={togglePage}
                  disabled={rows.length === 0}
                />
              </th>
              {SORTABLE.slice(0, 1).map(({ key, label }) => (
                <th key={key} scope="col" aria-sort={ariaSort(key)} className="py-2">
                  <SortButton label={label} dir={sort?.key === key ? sort.dir : null} onClick={() => { setSort(nextSort(sort, key)); setPage(1); }} />
                </th>
              ))}
              <th scope="col" className="py-2">
                Category
              </th>
              {SORTABLE.slice(1).map(({ key, label }) => (
                <th key={key} scope="col" aria-sort={ariaSort(key)} className="py-2">
                  <SortButton label={label} dir={sort?.key === key ? sort.dir : null} onClick={() => { setSort(nextSort(sort, key)); setPage(1); }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const status = stockStatus(p.stock);
              return (
                <tr key={p._id} className="border-b border-app-cream-dark last:border-0">
                  <td className="py-2">
                    <input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.has(p._id)} onChange={() => toggle(p._id)} />
                  </td>
                  <td className="py-2 font-medium text-app-text">{p.name}</td>
                  <td className="py-2 text-app-text-light">{categoryName(p.category)}</td>
                  <td className="py-2">${p.price.toFixed(2)}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <StockCell product={p} onSave={onStockChange} />
                      {status === "low" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Low</span>
                      )}
                      {status === "out" && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Out of stock</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-app-text-light">
          {products.length === 0 ? "No products yet" : `No products match “${query.trim()}”`}
        </p>
      )}

      <nav aria-label="Pagination" className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-app-text-light">
          Showing {from}–{to} of {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(current - 1)}
            disabled={current <= 1}
            className="rounded-full border border-app-border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {current} of {pages}
          </span>
          <button
            onClick={() => setPage(current + 1)}
            disabled={current >= pages}
            className="rounded-full border border-app-border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </nav>
    </section>
  );
};

// The header button's accessible name is just the column label; the arrow is decoration, and the
// sort state is announced through aria-sort on the <th>.
const SortButton = ({ label, dir, onClick }) => (
  <button onClick={onClick} className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide hover:text-app-green">
    {label}
    <span aria-hidden="true">{dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}</span>
  </button>
);

export default AdminProductsTable;
