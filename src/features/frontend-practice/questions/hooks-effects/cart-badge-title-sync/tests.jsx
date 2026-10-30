import { act, render, screen } from "@testing-library/react";
import CartButton from "./src/components/CartButton";
import useCartStore from "./src/store/useCartStore";
import { products } from "./src/data/products";

const bananas = products[0]; // $1.20
const croissant = products[3]; // $2.25

const add = (product, quantity = 1) => act(() => useCartStore.getState().add_item(product, quantity));

beforeEach(() => {
  useCartStore.getState().clear_cart();
  document.title = "Products | Instacart";
});

describe("CartButton", () => {
  it("shows the item count in the badge", () => {
    render(<CartButton />);
    add(bananas, 2);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("sets the title from a cart that already has items when it mounts", () => {
    useCartStore.getState().add_item(bananas, 3);
    render(<CartButton />);
    expect(document.title).toBe("(3) Cart · $3.60 | Instacart");
  });

  it("updates the tab title when an item is added after mounting", () => {
    render(<CartButton />);
    expect(document.title).toBe("Instacart");
    add(bananas);
    expect(document.title).toBe("(1) Cart · $1.20 | Instacart");
    add(croissant);
    expect(document.title).toBe("(2) Cart · $3.45 | Instacart");
  });

  it("updates the title when only the quantity of an existing item changes", () => {
    render(<CartButton />);
    add(bananas);
    add(bananas);
    expect(document.title).toBe("(2) Cart · $2.40 | Instacart");
  });

  it("goes back to the plain title when the cart is emptied", () => {
    useCartStore.getState().add_item(bananas, 2);
    render(<CartButton />);
    expect(document.title).toBe("(2) Cart · $2.40 | Instacart");
    act(() => useCartStore.getState().clear_cart());
    expect(document.title).toBe("Instacart");
  });

  it("restores the previous title when it unmounts", () => {
    const { unmount } = render(<CartButton />);
    add(bananas);
    unmount();
    expect(document.title).toBe("Products | Instacart");
  });
});
