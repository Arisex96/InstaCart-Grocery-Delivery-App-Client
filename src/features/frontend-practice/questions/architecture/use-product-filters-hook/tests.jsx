import { act, render, renderHook, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import ProductsPage from "./src/components/ProductsPage";
import useProductFilters from "./src/hooks/useProductFilters";
import { products } from "./src/data/products";

const names = () => within(screen.getByLabelText("Results")).queryAllByRole("listitem").map((li) => li.firstChild.textContent);
const urlOf = () => screen.getByTestId("url").textContent.replace("URL: /products", "");

function Nav() {
  const navigate = useNavigate();
  const { search } = useLocation();
  return (
    <>
      <span data-testid="search">{search}</span>
      <button onClick={() => navigate("/products?category=snacks")}>go snacks</button>
    </>
  );
}

const show = (url = "/products") =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Nav />
      <ProductsPage products={products} />
    </MemoryRouter>,
  );

const hookWrapper = (url = "/products") => ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;

describe("useProductFilters: reading the URL", () => {
  it("reads category and sort from the URL on first render", () => {
    show("/products?category=bakery&sortBy=price-high-to-low");
    expect(screen.getByRole("button", { name: "Bakery" })).toHaveAttribute("aria-pressed", "true");
    expect(names()).toEqual(["Sourdough Loaf", "Butter Croissant 100g"]);
  });

  it("follows external navigation (links, Back) while mounted", () => {
    show("/products?category=bakery");
    expect(names()).toEqual(["Butter Croissant 100g", "Sourdough Loaf"]);
    fireEvent.click(screen.getByRole("button", { name: "go snacks" }));
    expect(screen.getByRole("button", { name: "Snacks" })).toHaveAttribute("aria-pressed", "true");
    expect(names().sort()).toEqual(["Dark Chocolate Bar", "Sea Salt Chips"]);
  });

  it("treats an empty or invalid price param as no filter", () => {
    show("/products?minPrice=&maxPrice=abc");
    expect(names()).toHaveLength(products.length);
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
  });
});

describe("useProductFilters: writing the URL", () => {
  it("keeps the other params when a setter changes one", async () => {
    const user = userEvent.setup();
    show("/products?search=bread");
    await user.click(screen.getByRole("button", { name: "Snacks" }));
    expect(urlOf()).toContain("category=snacks");
    expect(urlOf()).toContain("search=bread");
    await user.selectOptions(screen.getByLabelText("Sort by"), "rating");
    expect(urlOf()).toContain("sortBy=rating");
    expect(urlOf()).toContain("category=snacks");
  });

  it("removes the param for the \"all\" category and the default sort", async () => {
    const user = userEvent.setup();
    show("/products?category=snacks&sortBy=rating&search=x");
    await user.click(screen.getByRole("button", { name: "All Products" }));
    await user.selectOptions(screen.getByLabelText("Sort by"), "default");
    expect(urlOf()).toBe("?search=x");
  });

  it("searches case-insensitively and survives products with a null description", async () => {
    const user = userEvent.setup();
    show();
    await user.type(screen.getByLabelText("Search products"), "OLIVE");
    expect(names()).toEqual(["Extra Virgin Olive Oil"]);
    await user.clear(screen.getByLabelText("Search products"));
    await user.type(screen.getByLabelText("Search products"), "zzz");
    expect(screen.getByText("No products match")).toBeInTheDocument();
  });

  it("treats the price range as inclusive", () => {
    show("/products?minPrice=3.5&maxPrice=4.25");
    expect(names().sort()).toEqual(["Orange Juice", "Whole Milk"]);
  });

  it("reset clears every filter param and re-disables itself", async () => {
    const user = userEvent.setup();
    show("/products?category=snacks&search=choc&sortBy=rating&minPrice=1&maxPrice=9&keep=me");
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(urlOf()).toBe("?keep=me");
    expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled();
    expect(names()).toHaveLength(products.length);
  });
});

describe("useProductFilters: derived list", () => {
  it("does not mutate the products it was given", () => {
    const input = [...products];
    const before = input.map((p) => p._id);
    renderHook(() => useProductFilters(input), { wrapper: hookWrapper("/products?sortBy=price-low-to-high") });
    expect(input.map((p) => p._id)).toEqual(before);
  });

  it("keeps the identity of filtered while nothing relevant changes, and changes it when something does", () => {
    const { result, rerender } = renderHook(() => useProductFilters(products), { wrapper: hookWrapper("/products?category=bakery") });
    const first = result.current.filtered;
    rerender();
    expect(result.current.filtered).toBe(first);
    act(() => result.current.setSearch("loaf"));
    expect(result.current.filtered).not.toBe(first);
    expect(result.current.filtered.map((p) => p.name)).toEqual(["Sourdough Loaf"]);
  });
});
