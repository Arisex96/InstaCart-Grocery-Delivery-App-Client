// src/__tests__/AddToCartButton.test.jsx — reference test suite.
// Comments name the planted bug each assertion is responsible for catching.
import { render, screen, fireEvent } from "@testing-library/react";
import AddToCartButton from "../components/AddToCartButton";
import useCartStore from "../store/useCartStore";
import { products } from "../data/products";

const bananas = products[0]; // stock 40
const milk = products[1]; // stock 3
const avocados = products[2]; // stock 0

const plus = () => screen.getByRole("button", { name: "Increase quantity" });
const minus = () => screen.getByRole("button", { name: "Decrease quantity" });
const quantity = () => screen.getByTestId("quantity").textContent;
const clicks = (button, times) => {
  for (let i = 0; i < times; i++) fireEvent.click(button);
};

beforeEach(() => useCartStore.getState().clear_cart());

describe("quantity stepper", () => {
  // Finding the buttons by accessible name also catches a wrong or missing aria-label.
  it("starts at 1 and the + and - buttons change it", () => {
    render(<AddToCartButton product={bananas} />);
    expect(quantity()).toBe("1");
    clicks(plus(), 2);
    expect(quantity()).toBe("3");
    clicks(minus(), 1);
    expect(quantity()).toBe("2");
  });

  // Catches a wrong lower limit (0 instead of 1).
  it("never goes below 1", () => {
    render(<AddToCartButton product={bananas} />);
    clicks(minus(), 3);
    expect(quantity()).toBe("1");
  });

  // Catches a missing stock limit.
  it("never goes above the available stock", () => {
    render(<AddToCartButton product={milk} />);
    clicks(plus(), 10);
    expect(quantity()).toBe("3");
  });
});

describe("adding to the cart", () => {
  // Catches the selected quantity being ignored (always adding 1).
  it("adds the selected quantity to the cart", () => {
    render(<AddToCartButton product={bananas} />);
    clicks(plus(), 2);
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    const { items, total_items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product._id).toBe(bananas._id);
    expect(items[0].quantity).toBe(3);
    expect(total_items).toBe(3);
  });

  // Catches the selector not resetting after an add.
  it("resets the selector to 1 after adding", () => {
    render(<AddToCartButton product={bananas} />);
    clicks(plus(), 4);
    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(quantity()).toBe("1");
  });
});

describe("sold out", () => {
  // Catches the button not being disabled for a sold-out product.
  it("shows a disabled Out of stock button and adds nothing", () => {
    render(<AddToCartButton product={avocados} />);
    const button = screen.getByRole("button", { name: "Out of stock" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(useCartStore.getState().total_items).toBe(0);
  });
});
