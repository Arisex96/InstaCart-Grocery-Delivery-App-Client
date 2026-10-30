import { filterProducts } from "./src/lib/filterProducts";
import { products } from "./src/data/products";

const names = (list) => list.map((p) => p.name);
const prices = (list) => list.map((p) => p.price);

describe("filterProducts", () => {
  it("returns every product for category all with no other filters", () => {
    expect(filterProducts(products, { category: "all" })).toHaveLength(12);
    expect(filterProducts(products)).toHaveLength(12);
  });

  it("matches the category case-insensitively", () => {
    expect(names(filterProducts(products, { category: "BAKERY" }))).toEqual(["Butter Croissant 100g", "Sourdough Loaf"]);
  });

  it("searches names and descriptions case-insensitively", () => {
    expect(names(filterProducts(products, { searchQuery: "  RICE " }))).toEqual(["Basmati Rice"]);
    expect(names(filterProducts(products, { searchQuery: "kettle" }))).toEqual(["Sea Salt Chips"]);
  });

  it("does not throw when a product has a null description", () => {
    expect(products.some((p) => p.description === null)).toBe(true);
    expect(() => filterProducts(products, { searchQuery: "zzz-no-match" })).not.toThrow();
    expect(filterProducts(products, { searchQuery: "zzz-no-match" })).toEqual([]);
    expect(names(filterProducts(products, { searchQuery: "olive" }))).toEqual(["Extra Virgin Olive Oil"]);
  });

  it("treats the price range as inclusive at both ends", () => {
    const result = filterProducts(products, { minPrice: 2.25, maxPrice: 3.5, sortBy: "price-low-to-high" });
    expect(prices(result)).toEqual([2.25, 2.7, 3, 3.5]);
  });

  it("ignores NaN, null and undefined price bounds", () => {
    expect(filterProducts(products, { minPrice: NaN, maxPrice: NaN })).toHaveLength(12);
    expect(filterProducts(products, { minPrice: null, maxPrice: undefined })).toHaveLength(12);
    expect(filterProducts(products, { minPrice: NaN, maxPrice: 2 })).toHaveLength(2);
  });

  it("sorts by price numerically in both directions", () => {
    const low = prices(filterProducts(products, { sortBy: "price-low-to-high" }));
    expect(low).toEqual([1.2, 2, 2.25, 2.7, 3, 3.5, 4.25, 4.8, 4.99, 5.99, 8.5, 11.99]);
    const high = prices(filterProducts(products, { sortBy: "price-high-to-low" }));
    expect(high).toEqual([...low].reverse());
  });

  it("sorts by rating, discount (descending) and name", () => {
    expect(names(filterProducts(products, { sortBy: "rating" })).slice(0, 2)).toEqual(["Sourdough Loaf", "Extra Virgin Olive Oil"]);
    expect(names(filterProducts(products, { sortBy: "discount" }))[0]).toBe("Whole Milk");
    expect(names(filterProducts(products, { sortBy: "name-asc" })).slice(0, 2)).toEqual(["Basmati Rice", "Butter Croissant 100g"]);
  });

  it("applies the limit after sorting, so Featured shows the cheapest items", () => {
    const featured = filterProducts(products, { sortBy: "price-low-to-high", limit: 3 });
    expect(prices(featured)).toEqual([1.2, 2, 2.25]);
  });

  it("does not mutate the products array it was given", () => {
    const input = [...products];
    filterProducts(input, { sortBy: "price-low-to-high" });
    filterProducts(input, { sortBy: "name-asc" });
    expect(names(input)).toEqual(names(products));
  });
});
