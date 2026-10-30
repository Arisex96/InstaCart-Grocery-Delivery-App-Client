// src/lib/tableUtils.js — pure helpers for the admin products table.
// The component files import these; the tests also call them directly.
//
// Product shape: { _id, name, category, price, stock, ... } (see src/data/products.js)

export const PAGE_SIZE = 5;

/**
 * Sort state is `null` (original order) or { key: "name" | "price" | "stock", dir: "asc" | "desc" }.
 * Clicking a column header cycles: not sorted -> asc -> desc -> not sorted.
 * Clicking a *different* column starts that column at asc.
 */
export const nextSort = (sort, key) => sort; // TODO

/** Case-insensitive "contains" match on the product name. A blank query keeps everything. */
export const filterProducts = (products, query) => products; // TODO

/** Returns a NEW sorted array (never mutates). Names with localeCompare, numbers numerically. null = original order. */
export const sortProducts = (products, sort) => products; // TODO

export const pageCount = (total, pageSize = PAGE_SIZE) => 1; // TODO (at least 1, even for 0 items)

/** Items of the 1-based `page`. */
export const paginate = (items, page, pageSize = PAGE_SIZE) => items; // TODO

/** "out" (0 or less), "low" (1 to 5), otherwise "ok". */
export const stockStatus = (stock) => "ok"; // TODO

/**
 * Parses what the user typed into the stock input.
 * Valid: a whole number, 0 or more ("0", "12", " 7 "). Invalid: "", "-1", "2.5", "abc".
 * -> { ok: true, value: 12 } | { ok: false }
 */
export const parseStock = (raw) => ({ ok: false }); // TODO
