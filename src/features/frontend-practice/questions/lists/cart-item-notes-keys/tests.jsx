import { render, screen, fireEvent } from "@testing-library/react";
import CartItemList from "./src/components/CartItemList";
import { products } from "./src/data/products";

const [bananas, milk, , , bread] = products;
const line = (product) => ({ product, quantity: 1 });
const lines = [line(bananas), line(milk), line(bread)];

const note = (product) => screen.getByLabelText(`Note for ${product.name}`);
const write = (product, text) => fireEvent.change(note(product), { target: { value: text } });
const noop = () => {};

describe("CartItemList notes", () => {
  it("renders one row per item with its name and unit price", () => {
    render(<CartItemList items={lines} onRemove={noop} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("$3.5 / 1 gal × 1")).toBeInTheDocument();
  });

  it("keeps a note with its product when an earlier row is removed", () => {
    const { rerender } = render(<CartItemList items={lines} onRemove={noop} />);
    write(bananas, "ripe please");

    rerender(<CartItemList items={[line(milk), line(bread)]} onRemove={noop} />);
    expect(note(milk)).toHaveValue("");
    expect(note(bread)).toHaveValue("");
  });

  it("keeps notes with their products when the list is reordered", () => {
    const { rerender } = render(<CartItemList items={lines} onRemove={noop} />);
    write(bananas, "note for bananas");
    write(milk, "note for milk");

    rerender(<CartItemList items={[line(bread), line(milk), line(bananas)]} onRemove={noop} />);
    expect(note(bananas)).toHaveValue("note for bananas");
    expect(note(milk)).toHaveValue("note for milk");
    expect(note(bread)).toHaveValue("");
  });

  it("keeps the other notes when the last row is removed", () => {
    const { rerender } = render(<CartItemList items={lines} onRemove={noop} />);
    write(bananas, "keep me");
    rerender(<CartItemList items={[line(bananas), line(milk)]} onRemove={noop} />);
    expect(note(bananas)).toHaveValue("keep me");
  });

  it("calls onRemove with the product _id", () => {
    const onRemove = fn();
    render(<CartItemList items={lines} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove Whole Milk" }));
    expect(onRemove).toHaveBeenCalledWith("p2");
  });

  it("does not log React key warnings", () => {
    const { rerender } = render(<CartItemList items={lines} onRemove={noop} />);
    rerender(<CartItemList items={[line(bread), line(milk)]} onRemove={noop} />);
    const keyWarnings = consoleErrors().filter((message) => /key/.test(message));
    expect(keyWarnings).toEqual([]);
  });
});
