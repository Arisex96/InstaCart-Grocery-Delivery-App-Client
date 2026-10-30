import { render, screen, within } from "@testing-library/react";
import OrderSummary from "./src/components/OrderSummary";

// Tests describe the contract in the UI requirements (roles, labels, text), not class names,
// so any valid implementation passes.
const item = (name, price, quantity = 1, id = name) => ({ product: { _id: id, name, price }, quantity });

/** Value of the <dd> that follows the <dt> with this label. */
const figure = (label) => {
  const term = screen.getByText(label, { selector: "dt" });
  return term.nextElementSibling.textContent.trim();
};

describe("order lines", () => {
  it("renders a heading and one line per item with name, quantity and line total", () => {
    render(<OrderSummary items={[item("Bananas", 1.2, 3), item("Milk", 3.5, 1)]} />);
    expect(screen.getByRole("heading", { name: "Order summary", level: 2 })).toBeInTheDocument();
    const lines = screen.getAllByRole("listitem");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveTextContent("Bananas");
    expect(lines[0]).toHaveTextContent("× 3");
    expect(lines[0]).toHaveTextContent("$3.60"); // 1.2 × 3 without floating point noise
    expect(within(lines[1]).getByText("$3.50")).toBeInTheDocument();
  });
});

describe("totals", () => {
  it("shows the subtotal as the sum of the line totals", () => {
    render(<OrderSummary items={[item("A", 10, 2), item("B", 0.1, 3)]} />);
    expect(figure("Subtotal")).toBe("$20.30");
  });

  it("charges 4.99 delivery below $50 and shows how much is missing", () => {
    render(<OrderSummary items={[item("A", 10, 2)]} />);
    expect(figure("Delivery")).toBe("$4.99");
    expect(screen.getByText("Add $30.00 more for free delivery")).toBeInTheDocument();
  });

  it("makes delivery free at exactly $50.00 and hides the hint", () => {
    render(<OrderSummary items={[item("A", 25, 2)]} />);
    expect(figure("Delivery")).toBe("Free");
    expect(screen.queryByText(/more for free delivery/)).not.toBeInTheDocument();
  });

  it("does not give free delivery at $49.99", () => {
    render(<OrderSummary items={[item("A", 49.99, 1)]} />);
    expect(figure("Delivery")).toBe("$4.99");
    expect(screen.getByText("Add $0.01 more for free delivery")).toBeInTheDocument();
  });

  it("adds 18% tax rounded to cents", () => {
    const { rerender } = render(<OrderSummary items={[item("A", 10, 2)]} />);
    expect(figure("Tax (18%)")).toBe("$3.60");
    rerender(<OrderSummary items={[item("B", 3.33, 1)]} />);
    expect(figure("Tax (18%)")).toBe("$0.60"); // 0.5994 rounds up
  });

  it("totals subtotal + delivery + tax", () => {
    render(<OrderSummary items={[item("A", 10, 2)]} />);
    expect(figure("Total")).toBe("$28.59"); // 20.00 + 4.99 + 3.60
  });
});

describe("states", () => {
  it("shows an empty message and no totals for an empty cart", () => {
    render(<OrderSummary items={[]} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();
  });

  it("updates every figure when the items change", () => {
    const { rerender } = render(<OrderSummary items={[item("A", 10, 1)]} />);
    expect(figure("Total")).toBe("$16.79"); // 10 + 4.99 + 1.80
    rerender(<OrderSummary items={[item("A", 10, 6)]} />);
    expect(figure("Subtotal")).toBe("$60.00");
    expect(figure("Delivery")).toBe("Free");
    expect(figure("Total")).toBe("$70.80");
  });
});
