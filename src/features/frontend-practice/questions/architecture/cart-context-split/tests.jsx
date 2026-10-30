import { act, render, renderHook, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Shop from "./src/components/Shop";
import { CartProvider, useCartActions, useCartState } from "./src/context/CartContext";
import { products as allProducts } from "./src/data/products";

const products = allProducts.slice(0, 3); // bananas 1.20, milk 3.50, avocados 2.00

// Rows call onRender(productId) and the badge calls onRender("badge"): one call = one render.
const onRender = fn();
const count = (key) => onRender.mock.calls.filter(([k]) => k === key).length;
const rowCounts = () => products.map((p) => count(p._id));
const show = () => render(<Shop products={products} onRender={onRender} />);
const add = (name) => fireEvent.click(screen.getByRole("button", { name: `Add ${name}` }));

beforeEach(() => onRender.mockClear());

describe("cart context behaviour", () => {
  it("renders every consumer once on mount", () => {
    show();
    expect(count("badge")).toBe(1);
    expect(rowCounts()).toEqual([1, 1, 1]);
  });

  it("adds products, merging quantities and totalling the price", () => {
    show();
    add("Organic Bananas");
    add("Organic Bananas");
    add("Whole Milk");
    expect(screen.getByTestId("cart-summary")).toHaveTextContent("3 items · $5.90");
  });

  it("removes a line through the actions", () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => ({ state: useCartState(), actions: useCartActions() }), { wrapper });
    act(() => result.current.actions.add(products[0]));
    act(() => result.current.actions.add(products[1]));
    act(() => result.current.actions.remove(products[0]._id));
    act(() => result.current.actions.remove("does-not-exist"));
    expect(result.current.state.items.map((l) => l.product._id)).toEqual([products[1]._id]);
    expect(result.current.state.count).toBe(1);
  });
});

describe("render behaviour", () => {
  it("does not re-render the badge or any row when the search box changes", async () => {
    const user = userEvent.setup();
    show();
    onRender.mockClear();
    await user.type(screen.getByLabelText("Search the shop"), "milk");
    expect(count("badge")).toBe(0);
    expect(rowCounts()).toEqual([0, 0, 0]);
  });

  it("re-renders the badge exactly once per add, and no product rows", () => {
    show();
    onRender.mockClear();
    add("Whole Milk");
    expect(count("badge")).toBe(1);
    expect(rowCounts()).toEqual([0, 0, 0]);
  });

  it("keeps add and remove stable across state changes and provider re-renders", () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result, rerender } = renderHook(() => useCartActions(), { wrapper });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(result.current.add).toBe(first.add);
    expect(result.current.remove).toBe(first.remove);

    // Also stable after the cart contents changed.
    const both = renderHook(() => ({ actions: useCartActions(), state: useCartState() }), { wrapper });
    const before = both.result.current.actions.add;
    act(() => both.result.current.actions.add(products[0]));
    expect(both.result.current.state.count).toBe(1);
    expect(both.result.current.actions.add).toBe(before);
  });
});

describe("hook guards", () => {
  it("throws a clear error when the hooks are used outside a CartProvider", () => {
    const original = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useCartActions())).toThrow("useCartActions must be used inside <CartProvider>");
      expect(() => renderHook(() => useCartState())).toThrow("useCartState must be used inside <CartProvider>");
    } finally {
      console.error = original;
    }
  });
});
