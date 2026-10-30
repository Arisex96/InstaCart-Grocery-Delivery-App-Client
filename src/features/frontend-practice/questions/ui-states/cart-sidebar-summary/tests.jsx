import { fireEvent, render, screen } from "@testing-library/react";
import CartSummary from "./src/components/CartSummary";
import { products } from "./src/data/products";

const [bananas, milk] = products; // 1.20 each, 3.50 each
const line = (product, quantity) => ({ product, quantity });
const show = (items, onCheckout = fn()) => {
  render(<CartSummary items={items} onCheckout={onCheckout} />);
  return onCheckout;
};

describe("empty cart", () => {
  it("shows an explicit empty cart message and no subtotal", () => {
    show([]);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
  });

  it("disables Checkout and never calls onCheckout for an empty cart", () => {
    const onCheckout = show([]);
    const button = screen.getByRole("button", { name: "Checkout" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onCheckout).not.toHaveBeenCalled();
  });
});

describe("item count", () => {
  it("counts units, not cart lines", () => {
    show([line(bananas, 3), line(milk, 2)]);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Your cart (5 items)");
  });

  it("uses the singular for exactly one unit", () => {
    show([line(bananas, 1)]);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Your cart (1 item)");
    expect(screen.getByRole("heading", { level: 2 })).not.toHaveTextContent("1 items");
  });

  it("uses the plural for one line with several units", () => {
    show([line(milk, 2)]);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Your cart (2 items)");
  });
});

describe("money", () => {
  it("formats line totals with two decimals", () => {
    show([line(bananas, 2), line(milk, 1)]);
    expect(screen.getByText("$2.40")).toBeInTheDocument(); // line total of 2 x 1.20
    expect(screen.getByText("$3.50")).toBeInTheDocument(); // line total of 1 x 3.50
  });

  it("formats the subtotal with two decimals and no floating point noise (1.2 x 3)", () => {
    show([line(bananas, 3)]);
    const subtotal = screen.getByText("Subtotal").nextSibling;
    expect(subtotal).toHaveTextContent("$3.60");
    expect(document.body.textContent).not.toMatch(/3\.59999/);
  });
});

describe("non-empty cart", () => {
  it("lists every product and enables Checkout, calling onCheckout once per click", () => {
    const onCheckout = show([line(bananas, 1), line(milk, 1)]);
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Checkout" });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onCheckout).toHaveBeenCalledTimes(1);
  });
});
