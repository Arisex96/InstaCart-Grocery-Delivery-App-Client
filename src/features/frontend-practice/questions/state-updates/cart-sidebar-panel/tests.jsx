import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartPanel from "./src/components/CartPanel";
import useCartStore from "./src/store/useCartStore";
import { products } from "./src/data/products";

// Tests check the contract in the UI requirements (roles, aria-labels, text), not class names.
const [bananas, milk] = products; // bananas $1.20 stock 40, milk $3.50 stock 3
const store = () => useCartStore.getState();
const add = (product, qty) => act(() => store().add_item(product, qty));
const row = (name) => screen.getByText(name).closest("li");
const qty = (name) => screen.getByLabelText(`Quantity of ${name}`);

beforeEach(() => act(() => store().clear_cart()));

describe("cart panel", () => {
  it("shows the header with the total number of units (singular and plural)", () => {
    render(<CartPanel onContinue={fn()} />);
    add(bananas, 3);
    add(milk, 1);
    expect(screen.getByRole("heading", { name: "Your cart (4 items)", level: 2 })).toBeInTheDocument();
    act(() => store().remove_item(bananas._id));
    act(() => store().update_quantity(milk._id, 1));
    expect(screen.getByRole("heading", { name: "Your cart (1 item)", level: 2 })).toBeInTheDocument();
  });

  it("renders each line with image, name, unit price and line total", () => {
    add(bananas, 3);
    render(<CartPanel onContinue={fn()} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByAltText("Organic Bananas")).toBeInTheDocument();
    expect(row("Organic Bananas")).toHaveTextContent("$1.20 / 1 lb");
    expect(row("Organic Bananas")).toHaveTextContent("$3.60"); // 1.2 × 3 without float noise
    expect(qty("Organic Bananas")).toHaveTextContent("3");
  });

  it("the increase button adds a unit and updates quantity, line total, header and subtotal", async () => {
    const user = userEvent.setup();
    add(milk, 1);
    render(<CartPanel onContinue={fn()} />);
    await user.click(screen.getByRole("button", { name: "Increase quantity of Whole Milk" }));
    expect(qty("Whole Milk")).toHaveTextContent("2");
    expect(row("Whole Milk")).toHaveTextContent("$7.00");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Your cart (2 items)");
    expect(screen.getByText("Subtotal", { selector: "dt" }).nextElementSibling).toHaveTextContent("$7.00");
  });

  it("disables increase once the quantity reaches the stock", async () => {
    const user = userEvent.setup();
    add(milk, 2);
    render(<CartPanel onContinue={fn()} />);
    const plus = screen.getByRole("button", { name: "Increase quantity of Whole Milk" });
    expect(plus).toBeEnabled();
    await user.click(plus); // 3 = stock
    expect(plus).toBeDisabled();
    await user.click(plus);
    expect(store().items[0].quantity).toBe(3);
  });

  it("decreases the quantity and removes the line when stepping down from 1", async () => {
    const user = userEvent.setup();
    add(bananas, 2);
    render(<CartPanel onContinue={fn()} />);
    const minus = screen.getByRole("button", { name: "Decrease quantity of Organic Bananas" });
    await user.click(minus);
    expect(qty("Organic Bananas")).toHaveTextContent("1");
    await user.click(minus);
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
    expect(store().items).toHaveLength(0);
  });

  it("removes a line with its Remove button and keeps the others", async () => {
    const user = userEvent.setup();
    add(bananas, 2);
    add(milk, 1);
    render(<CartPanel onContinue={fn()} />);
    await user.click(screen.getByRole("button", { name: "Remove Organic Bananas" }));
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Subtotal", { selector: "dt" }).nextElementSibling).toHaveTextContent("$3.50");
  });

  it("clears the whole cart with Clear cart and shows the empty state", async () => {
    const user = userEvent.setup();
    add(bananas, 2);
    add(milk, 1);
    render(<CartPanel onContinue={fn()} />);
    await user.click(screen.getByRole("button", { name: "Clear cart" }));
    expect(store().items).toHaveLength(0);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear cart" })).not.toBeInTheDocument();
    expect(screen.queryByText("Subtotal")).not.toBeInTheDocument();
  });

  it("shows an empty state whose Continue shopping button calls onContinue", async () => {
    const user = userEvent.setup();
    const onContinue = fn();
    render(<CartPanel onContinue={onContinue} />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue shopping" }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it("re-renders when the store changes from outside the panel", () => {
    render(<CartPanel onContinue={fn()} />);
    expect(screen.queryByText("Whole Milk")).not.toBeInTheDocument();
    add(milk, 2);
    expect(within(row("Whole Milk")).getByText("$7.00")).toBeInTheDocument();
    add(milk, 1);
    expect(qty("Whole Milk")).toHaveTextContent("3");
  });
});
