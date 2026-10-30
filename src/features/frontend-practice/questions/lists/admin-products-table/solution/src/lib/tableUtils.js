// src/lib/tableUtils.js — pure helpers for the admin products table.
// The component files import these; the tests also call them directly.
//
// APPROACH: the table is a pipeline over the full product list: filter -> sort -> paginate.
// Each step is a pure function, so sorting and searching naturally apply to ALL pages, not just
// the visible one (the classic mistake is sorting the current page only).

export const PAGE_SIZE = 5;

// not sorted -> asc -> desc -> not sorted; a different column starts at asc.
export const nextSort = (sort, key) => {
  if (!sort || sort.key !== key) return { key, dir: "asc" };
  return sort.dir === "asc" ? { key, dir: "desc" } : null;
};

export const filterProducts = (products, query) => {
  const q = query.trim().toLowerCase();
  return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
};

// Copy before sorting: Array.prototype.sort mutates, and `products` is the parent's state.
export const sortProducts = (products, sort) => {
  if (!sort) return products;
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...products].sort((a, b) => {
    const cmp = sort.key === "name" ? a.name.localeCompare(b.name) : a[sort.key] - b[sort.key];
    return cmp * sign;
  });
};

export const pageCount = (total, pageSize = PAGE_SIZE) => Math.max(1, Math.ceil(total / pageSize));

export const paginate = (items, page, pageSize = PAGE_SIZE) => items.slice((page - 1) * pageSize, page * pageSize);

export const stockStatus = (stock) => (stock <= 0 ? "out" : stock <= 5 ? "low" : "ok");

// Number("") is 0 and Number("2.5") is 2.5, so validate the text itself first.
export const parseStock = (raw) => {
  const text = String(raw).trim();
  return /^\d+$/.test(text) ? { ok: true, value: Number(text) } : { ok: false };
};
