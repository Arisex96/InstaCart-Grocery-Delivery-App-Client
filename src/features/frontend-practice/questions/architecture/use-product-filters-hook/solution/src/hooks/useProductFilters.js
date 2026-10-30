// src/hooks/useProductFilters.js — extracted from client/src/pages/Products.tsx so the grid, the header
// and the mobile drawer can share one source of filter state.
//
// Public API (do not change; ProductsPage depends on it):
//   const { filters, setCategory, setSearch, setSortBy, setPriceRange, reset, filtered, hasActiveFilters }
//     = useProductFilters(products);
//   filters = { category, search, sortBy, minPrice, maxPrice }   defaults: "all", "", "default", null, null
//   setPriceRange({ min, max })  values may be numbers, numeric strings or "" (= no limit)
//
// Filtering/sorting rules mirror client/src/components/ProductGrid.tsx. URL params used:
//   category, search, sortBy (default | price-low-to-high | price-high-to-low | rating | discount | name-asc),
//   minPrice, maxPrice
//
// Review feedback from QA: "Back does nothing", "picking a category clears my search",
// "Reset is enabled on a fresh page", "the product list got re-ordered".
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// An absent, empty or non-numeric param means "no limit" (null). Number("") and Number(null) are 0,
// which would silently turn "no value" into a real filter, so parse explicitly.
const parsePrice = (raw) => {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

export default function useProductFilters(products) {
  // ROOT CAUSE: the previous version copied the URL into useState once; later URL changes (Back,
  // links) were never seen. FIX: no copies. The URL is the only state, everything is derived.
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get("category");
  const rawSearch = searchParams.get("search");
  const rawSort = searchParams.get("sortBy");
  const rawMin = searchParams.get("minPrice");
  const rawMax = searchParams.get("maxPrice");

  const filters = useMemo(
    () => ({
      category: rawCategory || "all",
      search: rawSearch || "",
      sortBy: rawSort || "default",
      minPrice: parsePrice(rawMin),
      maxPrice: parsePrice(rawMax),
    }),
    [rawCategory, rawSearch, rawSort, rawMin, rawMax],
  );

  // FIX: setters change ONLY their own keys (functional update keeps every other param);
  // empty values delete the param so the URL stays clean.
  const update = useCallback(
    (patch, options) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(patch)) {
          if (value === null || value === undefined || value === "") next.delete(key);
          else next.set(key, String(value));
        }
        return next;
      }, options);
    },
    [setSearchParams],
  );

  const setCategory = useCallback((slug) => update({ category: slug === "all" ? null : slug }), [update]);
  // Typing should not fill the history with one entry per keystroke.
  const setSearch = useCallback((value) => update({ search: value }, { replace: true }), [update]);
  const setSortBy = useCallback((value) => update({ sortBy: value === "default" ? null : value }), [update]);
  const setPriceRange = useCallback(
    ({ min, max }) => update({ minPrice: parsePrice(min), maxPrice: parsePrice(max) }),
    [update],
  );
  const reset = useCallback(
    () => update({ category: null, search: null, sortBy: null, minPrice: null, maxPrice: null }),
    [update],
  );

  // ROOT CAUSE: when no filter ran, `list` was the incoming array and .sort() reordered the prop,
  // and a new array was returned on every render. FIX: copy, then memoise on the real inputs.
  const filtered = useMemo(() => {
    let list = [...products];
    const { category, search, sortBy, minPrice, maxPrice } = filters;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      // `description` is nullable server-side.
      list = list.filter((p) => p.name.toLowerCase().includes(query) || (p.description ?? "").toLowerCase().includes(query));
    }
    if (minPrice !== null) list = list.filter((p) => p.price >= minPrice);
    if (maxPrice !== null) list = list.filter((p) => p.price <= maxPrice);

    if (sortBy === "price-low-to-high") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high-to-low") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "discount") list.sort((a, b) => b.discount - a.discount);
    else if (sortBy === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, filters]);

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.search !== "" ||
    filters.sortBy !== "default" ||
    filters.minPrice !== null ||
    filters.maxPrice !== null;

  return { filters, setCategory, setSearch, setSortBy, setPriceRange, reset, filtered, hasActiveFilters };
}
