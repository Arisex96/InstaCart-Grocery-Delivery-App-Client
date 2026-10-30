import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductBrowser from "./src/components/ProductBrowser";
import { products, categories } from "./src/data/products";

// Tests check the contract in the UI requirements (labels, roles, text), not class names.
const show = (list = products) => render(<ProductBrowser products={list} categories={categories} />);
const names = () => screen.queryAllByRole("listitem").map((li) => li.textContent);
const hasNames = (expected) => {
  const items = screen.queryAllByRole("listitem");
  expect(items).toHaveLength(expected.length);
  expected.forEach((name, i) => expect(items[i]).toHaveTextContent(name));
};
const setPrice = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const count = () => screen.getByRole("status");

describe("initial state", () => {
  it("lists every product with the default controls and a disabled Clear filters", () => {
    show();
    expect(count()).toHaveTextContent("12 products");
    expect(names()).toHaveLength(12);
    expect(screen.getByLabelText("All products")).toBeChecked();
    expect(screen.getByLabelText("Min price")).toHaveValue("");
    expect(screen.getByLabelText("Max price")).toHaveValue("");
    expect(screen.getByLabelText("Sort by")).toHaveValue("default");
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeDisabled();
    expect(screen.getByRole("list", { name: "Products" })).toBeInTheDocument();
  });

  it("offers a radio per category plus All products in the Filters landmark", () => {
    show();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(categories.length + 1);
    expect(screen.getByRole("complementary", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByLabelText("Dairy & Eggs")).not.toBeChecked();
  });
});

describe("filtering", () => {
  it("filters by category and updates the count", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByLabelText("Bakery"));
    expect(count()).toHaveTextContent("2 products");
    hasNames(["Butter Croissant 100g", "Sourdough Loaf"]);
    await user.click(screen.getByLabelText("All products"));
    expect(count()).toHaveTextContent("12 products");
  });

  it("applies inclusive price bounds and treats an empty input as no limit", () => {
    show();
    setPrice("Min price", "3");
    setPrice("Max price", "4.25");
    // p2 3.50, p7 4.25 (upper bound), p8 3.00 (lower bound)
    expect(count()).toHaveTextContent("3 products");
    expect(names().join("|")).toContain("Orange Juice");
    expect(names().join("|")).toContain("Sea Salt Chips");
    setPrice("Max price", "");
    expect(count()).toHaveTextContent("8 products"); // everything >= 3
    setPrice("Min price", "");
    expect(count()).toHaveTextContent("12 products");
  });

  it("flags min greater than max with an alert and applies no price filter", () => {
    show();
    setPrice("Min price", "10");
    setPrice("Max price", "2");
    expect(screen.getByRole("alert")).toHaveTextContent("Min price must be at most max price");
    expect(count()).toHaveTextContent("12 products");
    setPrice("Max price", "20");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(count()).toHaveTextContent("1 product"); // only the olive oil (11.99) is within 10-20
    hasNames(["Extra Virgin Olive Oil"]);
  });

  it("combines category, price and sort, and pluralises the count", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByLabelText("Beverages"));
    setPrice("Max price", "4.5");
    expect(count()).toHaveTextContent("1 product");
    expect(count()).not.toHaveTextContent("1 products");
    hasNames(["Orange Juice"]);
  });

  it("shows a no-results message instead of the list when nothing matches", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByLabelText("Dairy & Eggs"));
    setPrice("Min price", "9");
    expect(count()).toHaveTextContent("0 products");
    expect(screen.getByText("No products match your filters")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Products" })).not.toBeInTheDocument();
  });
});

describe("sorting", () => {
  it("sorts by price in both directions", async () => {
    const user = userEvent.setup();
    show();
    await user.selectOptions(screen.getByLabelText("Sort by"), "Price: Low to High");
    expect(names()[0]).toContain("Organic Bananas");
    expect(names()[11]).toContain("Extra Virgin Olive Oil");
    await user.selectOptions(screen.getByLabelText("Sort by"), "Price: High to Low");
    expect(names()[0]).toContain("Extra Virgin Olive Oil");
    expect(names()[11]).toContain("Organic Bananas");
  });

  it("sorts by rating and by discount, keeping ties in the original order", async () => {
    const user = userEvent.setup();
    show();
    await user.selectOptions(screen.getByLabelText("Sort by"), "Highest rated");
    expect(names()[0]).toContain("Sourdough Loaf"); // 4.9, listed before the other 4.9
    expect(names()[1]).toContain("Extra Virgin Olive Oil");
    await user.selectOptions(screen.getByLabelText("Sort by"), "Biggest discount");
    hasNamesStart(["Whole Milk", "Sparkling Water", "Basmati Rice"]);
  });

  it("never mutates the products prop (a frozen array must not throw)", async () => {
    const user = userEvent.setup();
    const frozen = Object.freeze(products.slice());
    show(frozen);
    await user.selectOptions(screen.getByLabelText("Sort by"), "Price: High to Low");
    expect(names()[0]).toContain("Extra Virgin Olive Oil");
    expect(frozen.map((p) => p._id)).toEqual(products.map((p) => p._id));
    await user.selectOptions(screen.getByLabelText("Sort by"), "Default");
    expect(names()[0]).toContain("Organic Bananas"); // original order restored
  });
});

describe("clear filters", () => {
  it("is enabled once anything is active and resets every control", async () => {
    const user = userEvent.setup();
    show();
    await user.click(screen.getByLabelText("Snacks"));
    setPrice("Min price", "1");
    await user.selectOptions(screen.getByLabelText("Sort by"), "Highest rated");
    const clear = screen.getByRole("button", { name: "Clear filters" });
    expect(clear).toBeEnabled();
    await user.click(clear);
    expect(screen.getByLabelText("All products")).toBeChecked();
    expect(screen.getByLabelText("Min price")).toHaveValue("");
    expect(screen.getByLabelText("Sort by")).toHaveValue("default");
    expect(count()).toHaveTextContent("12 products");
    expect(clear).toBeDisabled();
  });

  it("shows the empty catalogue state for no products", () => {
    show([]);
    expect(count()).toHaveTextContent("0 products");
    expect(screen.getByText("No products match your filters")).toBeInTheDocument();
  });
});

function hasNamesStart(expected) {
  const items = screen.queryAllByRole("listitem");
  expected.forEach((name, i) => expect(items[i]).toHaveTextContent(name));
}
