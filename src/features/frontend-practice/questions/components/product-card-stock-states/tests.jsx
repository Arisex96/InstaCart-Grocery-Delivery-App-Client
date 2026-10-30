import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "./testing/utils";
import ProductCard from "./src/components/ProductCard";
import useCartStore from "./src/store/useCartStore";
import { products } from "./src/data/products";

const bananas = products[0]; // stock 40, no discount
const show = (over = {}) => renderWithRouter(<ProductCard product={{ ...bananas, ...over }} />);

beforeEach(() => useCartStore.getState().clear_cart());

describe("discount badge", () => {
  it("does not print a stray 0 for an undiscounted product", () => {
    show({ discount: 0 });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  });

  it("shows the percentage and the struck-through original price when discounted", () => {
    show({ discount: 20, price: 3.5, originalPrice: 4.4 });
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
    expect(screen.getByText("$4.40")).toHaveClass("line-through");
  });
});

describe("stock states", () => {
  it("shows Out of stock and disables the button when stock is 0", () => {
    show({ stock: 0 });
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled();
  });

  it("never touches the cart when an out-of-stock card is clicked", () => {
    show({ stock: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Out of stock" }));
    expect(useCartStore.getState().total_items).toBe(0);
  });

  it("shows a low stock warning for 1 to 5 units", () => {
    show({ stock: 3 });
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("treats exactly 5 as low stock and 6 as fine (boundaries)", () => {
    const { unmount } = show({ stock: 5 });
    expect(screen.getByText("Only 5 left")).toBeInTheDocument();
    unmount();
    show({ stock: 6 });
    expect(screen.queryByText(/Only \d+ left/)).not.toBeInTheDocument();
    expect(screen.queryByText("Out of stock")).not.toBeInTheDocument();
  });

  it("still adds exactly one unit per click for an in-stock product", () => {
    show({ stock: 40 });
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(useCartStore.getState().total_items).toBe(1);
    expect(useCartStore.getState().items[0].product._id).toBe(bananas._id);
  });
});
