// src/lib/filterProducts.js — the filtering + sorting pipeline that lives inside the useMemo of
// client/src/components/ProductGrid.tsx, extracted into a function.
//
// products: [{ _id, name, description (may be null!), category, price, rating, discount, ... }]
// options:  category ("all" | slug), searchQuery, minPrice / maxPrice (numbers, or NaN when the
//           matching <input type="number"> is empty), sortBy, limit (for the home "Featured" row)
// Returns the list to render. See src/Demo.jsx for the page that uses it.

export function filterProducts(
  products,
  { category = null, searchQuery = "", minPrice = null, maxPrice = null, sortBy = "", limit } = {},
) {
  let list = products;

  // 1. Category
  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }

  // 2. Search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    list = list.filter((p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }

  // 3. Price range
  if (minPrice !== null && minPrice !== undefined) {
    list = list.filter((p) => p.price > minPrice);
  }
  if (maxPrice !== null && maxPrice !== undefined) {
    list = list.filter((p) => p.price < maxPrice);
  }

  // 4. Limit (the Featured row only shows a few products)
  if (limit && limit > 0) {
    list = list.slice(0, limit);
  }

  // 5. Sorting
  if (sortBy === "price-low-to-high") {
    list.sort((a, b) => String(a.price).localeCompare(String(b.price)));
  } else if (sortBy === "price-high-to-low") {
    list.sort((a, b) => String(b.price).localeCompare(String(a.price)));
  } else if (sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "discount") {
    list.sort((a, b) => b.discount - a.discount);
  } else if (sortBy === "name-asc") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}
