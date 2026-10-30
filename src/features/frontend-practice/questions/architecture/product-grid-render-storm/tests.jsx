import { act, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductBrowser from "./src/components/ProductBrowser";
import useCartStore from "./src/store/useCartStore";
import { products as allProducts } from "./src/data/products";

const products = allProducts.slice(0, 5); // p1..p5
const ids = products.map((p) => p._id);

// Rows call onRowRender(id) from their body, so every call is one render of that row.
const onRowRender = fn();
const count = (id) => onRowRender.mock.calls.filter(([x]) => x === id).length;
const countAll = () => ids.map(count);

const show = (list = products) => render(<ProductBrowser products={list} onRowRender={onRowRender} />);

beforeEach(() => {
  useCartStore.getState().clear_cart();
  useCartStore.setState({ isCartOpen: false });
  onRowRender.mockClear();
});

describe("ProductBrowser render behaviour", () => {
  it("renders every row once on mount", () => {
    show();
    expect(countAll()).toEqual([1, 1, 1, 1, 1]);
  });

  it("does not re-render rows when the note field changes", async () => {
    const user = userEvent.setup();
    show();
    onRowRender.mockClear();
    await user.type(screen.getByLabelText("Note for shopper"), "hi");
    expect(countAll()).toEqual([0, 0, 0, 0, 0]);
  });

  it("does not re-render rows for an unrelated store change", () => {
    show();
    onRowRender.mockClear();
    act(() => useCartStore.getState().toggle_cart_view());
    expect(useCartStore.getState().isCartOpen).toBe(true);
    expect(countAll()).toEqual([0, 0, 0, 0, 0]);
  });

  it("updates the cart badge when adding, without re-rendering any row", () => {
    show();
    onRowRender.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Add Organic Bananas to cart" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Organic Bananas to cart" }));
    expect(screen.getByTestId("cart-badge")).toHaveTextContent("2");
    expect(useCartStore.getState().items[0].product._id).toBe("p1");
    expect(countAll()).toEqual([0, 0, 0, 0, 0]);
  });

  it("filters case-insensitively and re-renders no row that stays visible", async () => {
    const user = userEvent.setup();
    show();
    onRowRender.mockClear();
    await user.type(screen.getByLabelText("Search products"), "MILK");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(count("p2")).toBe(0);
  });

  it("brings rows back when the search is cleared", async () => {
    const user = userEvent.setup();
    show();
    await user.type(screen.getByLabelText("Search products"), "milk");
    await user.clear(screen.getByLabelText("Search products"));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("re-renders only the row whose product changed", () => {
    const view = show();
    onRowRender.mockClear();
    const updated = products.map((p) => (p._id === "p2" ? { ...p, price: 9.99 } : p));
    view.rerender(<ProductBrowser products={updated} onRowRender={onRowRender} />);
    expect(countAll()).toEqual([0, 1, 0, 0, 0]);
    expect(screen.getByText("$9.99 / 1 gal")).toBeInTheDocument();
  });
});
