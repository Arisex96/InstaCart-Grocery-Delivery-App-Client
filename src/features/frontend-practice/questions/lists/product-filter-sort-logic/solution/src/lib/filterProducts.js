// src/lib/filterProducts.js — the filtering + sorting pipeline that lives inside the useMemo of
// client/src/components/ProductGrid.tsx, extracted into a function.
//
// products: [{ _id, name, description (may be null!), category, price, rating, discount, ... }]
// options:  category ("all" | slug), searchQuery, minPrice / maxPrice (numbers, or NaN when the
//           matching <input type="number"> is empty), sortBy, limit (for the home "Featured" row)
// Returns the list to render. See src/Demo.jsx for the page that uses it.

// FIX (NaN): an empty number input becomes NaN, and every comparison with NaN is false.
const isBound = (value) => value !== null && value !== undefined && !Number.isNaN(value);

export function filterProducts(
  products,
  { category = null, searchQuery = "", minPrice = null, maxPrice = null, sortBy = "", limit } = {},
) {
  // ROOT CAUSE (mutation): `let list = products` aliased the caller's array, and sort() sorts in
  // place, so the shared catalogue got reordered. FIX: work on a copy.
  let list = [...products];

  // 1. Category — FIX: compare case-insensitively like the real ProductGrid
  if (category && category !== "all") {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  // 2. Search query — ROOT CAUSE (crash): description can be null, and null.toLowerCase() throws.
  // FIX: fall back to an empty string.
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(query) || (p.description ?? "").toLowerCase().includes(query),
    );
  }

  // 3. Price range — FIX: inclusive bounds, and only real numbers count as a bound.
  if (isBound(minPrice)) {
    list = list.filter((p) => p.price >= minPrice);
  }
  if (isBound(maxPrice)) {
    list = list.filter((p) => p.price <= maxPrice);
  }

  // 4. Sorting — ROOT CAUSE: prices were compared as strings ("11.99" < "2"). FIX: subtract numbers.
  if (sortBy === "price-low-to-high") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high-to-low") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "discount") {
    list.sort((a, b) => b.discount - a.discount);
  } else if (sortBy === "name-asc") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 5. Limit — ROOT CAUSE: it used to run BEFORE sorting, so "3 cheapest" returned the first 3
  // catalogue items, sorted. FIX: slice last.
  if (limit && limit > 0) {
    list = list.slice(0, limit);
  }

  return list;
}
