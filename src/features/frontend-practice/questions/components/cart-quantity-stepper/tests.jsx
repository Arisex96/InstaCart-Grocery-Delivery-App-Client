import { render, screen, fireEvent } from "@testing-library/react";
import QuantityStepper from "./src/components/QuantityStepper";
import CartItemCard from "./src/components/CartItemCard";
import useCartStore from "./src/store/useCartStore";
import { products } from "./src/data/products";

const plus = () => screen.getByRole("button", { name: "Increase quantity" });
const minus = () => screen.getByRole("button", { name: "Decrease quantity" });

beforeEach(() => useCartStore.getState().clear_cart());

describe("QuantityStepper", () => {
  it("shows the value and steps by one in each direction", () => {
    const onChange = fn();
    render(<QuantityStepper value={2} max={5} onChange={onChange} />);
    expect(screen.getByLabelText("Quantity")).toHaveTextContent("2");
    fireEvent.click(plus());
    fireEvent.click(minus());
    expect(onChange.mock.calls).toEqual([[3], [1]]);
  });

  it("disables the increase button and never asks for a value beyond max", () => {
    const onChange = fn();
    render(<QuantityStepper value={3} max={3} onChange={onChange} />);
    expect(plus()).toBeDisabled();
    fireEvent.click(plus());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("also stops when the value is already above max (stock dropped)", () => {
    const onChange = fn();
    render(<QuantityStepper value={5} max={3} onChange={onChange} />);
    expect(plus()).toBeDisabled();
  });

  it("disables the decrease button at the minimum and never asks for min - 1", () => {
    const onChange = fn();
    render(<QuantityStepper value={1} max={5} onChange={onChange} />);
    expect(minus()).toBeDisabled();
    fireEvent.click(minus());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("honours a custom min", () => {
    const onChange = fn();
    render(<QuantityStepper value={0} min={0} max={5} onChange={onChange} />);
    expect(minus()).toBeDisabled();
    expect(plus()).toBeEnabled();
  });

  it("has no upper limit when max is omitted", () => {
    render(<QuantityStepper value={99} onChange={fn()} />);
    expect(plus()).toBeEnabled();
  });

  it("disables both buttons when the disabled prop is set", () => {
    render(<QuantityStepper value={2} max={5} disabled onChange={fn()} />);
    expect(plus()).toBeDisabled();
    expect(minus()).toBeDisabled();
  });

  it("forwards extra props to the root and merges className", () => {
    render(<QuantityStepper value={2} max={5} onChange={fn()} data-testid="stepper" aria-label="Milk quantity" className="mt-2" />);
    const root = screen.getByTestId("stepper");
    expect(root).toHaveAttribute("aria-label", "Milk quantity");
    expect(root).toHaveClass("mt-2");
    expect(root).toHaveClass("inline-flex"); // base styling survives
  });
});

describe("CartItemCard integration", () => {
  const milk = products[1]; // stock 3

  it("updates the cart quantity and stops at the stock limit", () => {
    useCartStore.getState().add_item(milk, 2);
    const view = () => useCartStore.getState().items[0];
    const { rerender } = render(<CartItemCard item={view()} />);
    fireEvent.click(plus());
    expect(view().quantity).toBe(3);
    rerender(<CartItemCard item={view()} />);
    expect(plus()).toBeDisabled();
  });

  it("does not remove the line when minus is pressed at quantity 1", () => {
    useCartStore.getState().add_item(milk, 1);
    render(<CartItemCard item={useCartStore.getState().items[0]} />);
    fireEvent.click(minus());
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});
