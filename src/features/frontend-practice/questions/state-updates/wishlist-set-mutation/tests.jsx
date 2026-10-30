import { act, render, renderHook, screen } from "@testing-library/react";
import { useMemo } from "react";
import { useWishlist } from "./src/hooks/useWishlist";
import { products } from "./src/data/products";

const setup = (initial = products) =>
  renderHook(({ list }) => useWishlist(list), { initialProps: { list: initial } });

describe("toggling", () => {
  it("adds and removes a product, and has() follows immediately", () => {
    const { result } = setup();
    act(() => result.current.toggle("p1"));
    expect(result.current.has("p1")).toBe(true);
    expect(result.current.count).toBe(1);
    act(() => result.current.toggle("p1"));
    expect(result.current.has("p1")).toBe(false);
    expect(result.current.count).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("replaces ids with a new Set on every change instead of mutating the old one", () => {
    const { result } = setup();
    const before = result.current.ids;
    act(() => result.current.toggle("p1"));
    expect(result.current.ids).not.toBe(before);
    expect(before.size).toBe(0);
    expect(result.current.ids.has("p1")).toBe(true);
  });

  it("keeps count and total right when several products are toggled in one event", () => {
    const { result } = setup();
    act(() => {
      result.current.toggle("p4"); // 2.25
      result.current.toggle("p5"); // 5.99
      result.current.toggle("p1"); // 1.20
    });
    expect(result.current.count).toBe(3);
    expect(result.current.totalPrice).toBe(9.44);
  });

  it("rounds the total to cents", () => {
    const { result } = setup();
    act(() => result.current.toggle("p1")); // 1.2
    act(() => result.current.toggle("p2")); // 3.5
    act(() => result.current.toggle("p4")); // 2.25
    expect(result.current.totalPrice).toBe(6.95);
  });

  it("ignores ids that are not in the catalogue", () => {
    const { result } = setup();
    act(() => result.current.toggle("does-not-exist"));
    expect(result.current.count).toBe(0);
    expect(result.current.ids.size).toBe(0);
  });

  it("clear() empties the wishlist", () => {
    const { result } = setup();
    act(() => {
      result.current.toggle("p1");
      result.current.toggle("p2");
    });
    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
    expect(result.current.items).toEqual([]);
    expect(result.current.has("p1")).toBe(false);
  });
});

describe("derived values", () => {
  it("items lists exactly the saved products, so a memoised view updates", () => {
    function Saved({ list }) {
      const wishlist = useWishlist(list);
      // Like the real panel: a memo that depends on `ids`.
      const names = useMemo(() => [...wishlist.ids].map((id) => list.find((p) => p._id === id).name), [wishlist.ids, list]);
      return (
        <div>
          <button onClick={() => wishlist.toggle("p3")}>save avocados</button>
          <output data-testid="items">{wishlist.items.map((p) => p.name).join(",")}</output>
          <output data-testid="names">{names.join(",")}</output>
        </div>
      );
    }
    render(<Saved list={products} />);
    act(() => screen.getByText("save avocados").click());
    expect(screen.getByTestId("items")).toHaveTextContent("Hass Avocados");
    expect(screen.getByTestId("names")).toHaveTextContent("Hass Avocados");
  });

  it("totals use the current prices when the products prop changes", () => {
    const { result, rerender } = setup();
    act(() => {
      result.current.toggle("p1"); // 1.2
      result.current.toggle("p2"); // 3.5
    });
    expect(result.current.totalPrice).toBe(4.7);
    rerender({ list: products.map((p) => (p._id === "p2" ? { ...p, price: 4 } : p)) });
    expect(result.current.totalPrice).toBe(5.2);
    expect(result.current.count).toBe(2);
  });
});
