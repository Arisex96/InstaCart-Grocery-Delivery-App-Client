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
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function useProductFilters(products) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategoryState] = useState(searchParams.get("category") || "all");
  const [search, setSearchState] = useState(searchParams.get("search") || "");
  const [sortBy, setSortByState] = useState(searchParams.get("sortBy") || "default");
  const [minPrice, setMinPrice] = useState(Number(searchParams.get("minPrice")));
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice")) || null);

  const setCategory = (slug) => {
    setCategoryState(slug);
    setSearchParams({ category: slug });
  };

  const setSearch = (value) => {
    setSearchState(value);
    setSearchParams({ search: value });
  };

  const setSortBy = (value) => {
    setSortByState(value);
    setSearchParams({ sortBy: value });
  };

  const setPriceRange = ({ min, max }) => {
    setMinPrice(Number(min));
    setMaxPrice(Number(max) || null);
    setSearchParams({ minPrice: String(min), maxPrice: String(max) });
  };

  const reset = () => {
    setCategoryState("all");
    setSearchState("");
    setSortByState("default");
    setMinPrice(null);
    setMaxPrice(null);
  };

  let list = products;
  if (category !== "all") list = list.filter((p) => p.category === category);
  if (search.trim()) {
    const query = search.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }
  if (minPrice) list = list.filter((p) => p.price > minPrice);
  if (maxPrice) list = list.filter((p) => p.price < maxPrice);

  if (sortBy === "price-low-to-high") list.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high-to-low") list.sort((a, b) => b.price - a.price);
  else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "discount") list.sort((a, b) => b.discount - a.discount);
  else if (sortBy === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  const hasActiveFilters =
    category !== "all" || search !== "" || sortBy !== "default" || minPrice !== null || maxPrice !== null;

  return {
    filters: { category, search, sortBy, minPrice, maxPrice },
    setCategory,
    setSearch,
    setSortBy,
    setPriceRange,
    reset,
    filtered: list,
    hasActiveFilters,
  };
}
