import { render, screen, fireEvent } from "@testing-library/react";
import MiniCart from "./src/components/MiniCart";
import { products } from "./src/data/products";

const [bananas, milk] = products; // stock 40 and 3

const order = () => [
  { product: bananas, quantity: 1 },
  { product: milk, quantity: 2 },
];
const qty = (name) => screen.getByLabelText(name + " quantity");
const click = (label) => fireEvent.click(screen.getByRole("button", { name: label }));
describe("MiniCart", () => {
  it("renders every item with its quantity and the total", () => {
    render(<MiniCart initialItems={order()} />);
    expect(qty("Organic Bananas")).toHaveTextContent("1");
    expect(qty("Whole Milk")).toHaveTextContent("2");
    expect(screen.getByText("Total: $8.20")).toBeInTheDocument();
  });

  it("increases the quantity immediately and updates the total", () => {
    render(<MiniCart initialItems={order()} />);
    click("Increase Organic Bananas");
    expect(qty("Organic Bananas")).toHaveTextContent("2");
    expect(screen.getByText("Total: $9.40")).toBeInTheDocument();
  });

  it("decreases the quantity immediately", () => {
    render(<MiniCart initialItems={order()} />);
    click("Decrease Whole Milk");
    expect(qty("Whole Milk")).toHaveTextContent("1");
  });

  it("removes an item immediately when its quantity reaches 0", () => {
    render(<MiniCart initialItems={order()} />);
    click("Decrease Organic Bananas");
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
  });

  it("removes an item immediately with the remove button and shows the empty state", () => {
    render(<MiniCart initialItems={order()} />);
    click("Remove Whole Milk");
    expect(screen.queryByText("Whole Milk")).not.toBeInTheDocument();
    click("Remove Organic Bananas");
    expect(screen.getByText("Nothing to reorder")).toBeInTheDocument();
  });

  it("does not exceed the product stock", () => {
    render(<MiniCart initialItems={[{ product: milk, quantity: 3 }]} />);
    click("Increase Whole Milk");
    expect(qty("Whole Milk")).toHaveTextContent("3");
  });

  it("does not modify the data it was given", () => {
    const input = order();
    render(<MiniCart initialItems={input} />);
    click("Increase Organic Bananas");
    click("Decrease Whole Milk");
    click("Remove Whole Milk");
    expect(input).toHaveLength(2);
    expect(input[0].quantity).toBe(1);
    expect(input[1].quantity).toBe(2);
    expect(qty("Organic Bananas")).toHaveTextContent("2");
  });
});
