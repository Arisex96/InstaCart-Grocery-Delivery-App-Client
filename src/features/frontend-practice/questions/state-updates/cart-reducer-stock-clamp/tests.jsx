import { useReducer } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { cartReducer } from "./src/store/cartReducer";
import { products } from "./src/data/products";

const [bananas, milk, avocados] = products; // milk: 3 in stock, avocados: sold out
const fresh = () => ({ items: [], total_items: 0, total_price: 0 });
const add = (state, product, quantity = 1) => cartReducer(state, { type: "add", product, quantity });

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

describe("immutability", () => {
  it("does not mutate the previous state (deeply frozen input)", () => {
    let state = deepFreeze(fresh());
    state = deepFreeze(add(state, bananas, 2));
    state = deepFreeze(add(state, bananas, 1)); // existing line
    state = deepFreeze(add(state, milk, 1));
    state = deepFreeze(cartReducer(state, { type: "update", productId: bananas._id, quantity: 5 }));
    state = deepFreeze(cartReducer(state, { type: "remove", productId: milk._id }));
    expect(state.items.map((i) => [i.product._id, i.quantity])).toEqual([["p1", 5]]);
  });

  it("returns a new state object when an existing line changes", () => {
    const first = add(fresh(), bananas, 1);
    const second = add(first, bananas, 1);
    expect(second).not.toBe(first);
    expect(second.items[0].quantity).toBe(2);
    expect(first.items[0].quantity).toBe(1);
  });

  it("re-renders a component when the same product is added twice", () => {
    function Harness() {
      const [cart, dispatch] = useReducer(cartReducer, fresh());
      return (
        <div>
          <button onClick={() => dispatch({ type: "add", product: bananas, quantity: 1 })}>add</button>
          <output data-testid="qty">{cart.items[0]?.quantity ?? 0}</output>
        </div>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("qty")).toHaveTextContent("2");
  });
});

describe("add", () => {
  it("adds a new product and computes totals rounded to the cent", () => {
    const state = add(fresh(), bananas, 3);
    expect(state.items).toHaveLength(1);
    expect(state.total_items).toBe(3);
    expect(state.total_price).toBe(3.6); // 1.2 * 3 is 3.5999999999999996 in floating point
  });

  it("caps quantities at the stock and ignores sold-out products", () => {
    let state = add(fresh(), milk, 2);
    state = add(state, milk, 2); // only one more fits
    expect(state.items[0].quantity).toBe(3);
    expect(state.total_items).toBe(3);
    const unchanged = add(state, avocados, 1);
    expect(unchanged.items.map((i) => i.product._id)).toEqual(["p2"]);
  });
});

describe("update and remove", () => {
  it("update sets the quantity (capped at stock) and recomputes totals", () => {
    let state = add(add(fresh(), bananas, 1), milk, 1);
    state = cartReducer(state, { type: "update", productId: milk._id, quantity: 10 });
    expect(state.items.find((i) => i.product._id === "p2").quantity).toBe(3);
    expect(state.total_items).toBe(4);
    expect(state.total_price).toBe(11.7); // 1.2 + 3 * 3.5
  });

  it("removes a line on update to 0 or below, and on remove, keeping totals in sync", () => {
    let state = add(add(fresh(), bananas, 2), milk, 1);
    state = cartReducer(state, { type: "update", productId: milk._id, quantity: 0 });
    expect(state.items.map((i) => i.product._id)).toEqual(["p1"]);
    expect(state.total_items).toBe(2);
    state = cartReducer(state, { type: "remove", productId: bananas._id });
    expect(state.items).toEqual([]);
    expect(state.total_items).toBe(0);
    expect(state.total_price).toBe(0);
  });

  it("leaves the state untouched for unknown products and unknown actions", () => {
    const state = add(fresh(), bananas, 1);
    expect(cartReducer(state, { type: "update", productId: "nope", quantity: 2 })).toBe(state);
    expect(cartReducer(state, { type: "remove", productId: "nope" })).toBe(state);
    expect(cartReducer(state, { type: "explode" })).toBe(state);
  });
});
