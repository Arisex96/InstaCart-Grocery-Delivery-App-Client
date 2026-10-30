import { render, screen, within } from "@testing-library/react";
import GroupedProducts from "./src/components/GroupedProducts";
import { categories, products } from "./src/data/products";

const make = (id, name, category) => ({ ...products[0], _id: id, name, category });
const headers = () => screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
const rows = (sectionName) =>
  within(screen.getByRole("region", { name: sectionName }))
    .getAllByRole("listitem")
    .map((li) => li.querySelector("p").textContent);

const catalogue = () => [
  make("a", "Sourdough Loaf", "bakery"),
  make("b", "Whole Milk", "dairy-eggs"),
  make("c", "Organic Bananas", "fruits-vegetables"),
  make("d", "Sea Salt Chips", "snacks"),
  make("e", "Butter Croissant", "bakery"),
];

describe("GroupedProducts", () => {
  it("renders sections in the order of the categories prop, not the data order", () => {
    render(<GroupedProducts products={catalogue()} categories={categories} />);
    expect(headers().map((h) => h.replace(/ \(\d+\)$/, ""))).toEqual([
      "Fruits & Vegetables",
      "Dairy & Eggs",
      "Bakery",
      "Snacks",
    ]);
  });

  it("shows category names with the product count in the headers, not slugs", () => {
    render(<GroupedProducts products={catalogue()} categories={categories} />);
    expect(headers()).toContain("Bakery (2)");
    expect(headers()).toContain("Fruits & Vegetables (1)");
    expect(document.body.textContent).not.toMatch(/fruits-vegetables/);
  });

  it("hides categories that have no products", () => {
    render(<GroupedProducts products={catalogue()} categories={categories} />);
    expect(screen.queryByRole("heading", { name: /Beverages/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Pantry Staples/ })).not.toBeInTheDocument();
  });

  it("sorts products by name case-insensitively inside a section (apple before Banana)", () => {
    const list = [make("1", "Banana bread", "bakery"), make("2", "apple pie", "bakery"), make("3", "Cinnamon roll", "bakery")];
    render(<GroupedProducts products={list} categories={categories} />);
    expect(rows("Bakery")).toEqual(["apple pie", "Banana bread", "Cinnamon roll"]);
  });

  it("does not mutate the products prop", () => {
    const list = catalogue();
    const before = list.map((p) => p._id);
    render(<GroupedProducts products={list} categories={categories} />);
    expect(list.map((p) => p._id)).toEqual(before);
  });

  it("puts products with an unknown category into a final Other section", () => {
    const list = [...catalogue(), make("z", "Mystery jam", "seasonal")];
    render(<GroupedProducts products={list} categories={categories} />);
    const all = headers();
    expect(all[all.length - 1]).toBe("Other (1)");
    expect(rows("Other")).toEqual(["Mystery jam"]);
  });

  it("renders every product exactly once and keeps rows stable when props change", () => {
    const list = catalogue();
    const { rerender } = render(<GroupedProducts products={list} categories={categories} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(list.length);
    rerender(<GroupedProducts products={[make("n", "New Bagel", "bakery"), ...list]} categories={categories} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(list.length + 1);
    expect(rows("Bakery")).toEqual(["Butter Croissant", "New Bagel", "Sourdough Loaf"]);
  });
});
