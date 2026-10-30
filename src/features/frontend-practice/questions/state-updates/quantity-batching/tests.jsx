import { render, screen, fireEvent, act } from "@testing-library/react";
import { deferred } from "./testing/utils";
import ProductQuantityPicker from "./src/components/ProductQuantityPicker";
import { products } from "./src/data/products";

const bananas = products[0]; // stock 40
const withStock = (stock) => ({ ...bananas, stock });

const qty = () => screen.getByLabelText("Quantity");
const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const addedTotal = () => screen.getByTestId("added-total");

describe("ProductQuantityPicker", () => {
  it("adds one unit per + click and subtracts per - click", () => {
    render(<ProductQuantityPicker product={bananas} onAdd={fn()} />);
    click("Increase");
    click("Increase");
    expect(qty()).toHaveTextContent("3");
    click("Decrease");
    expect(qty()).toHaveTextContent("2");
  });

  it("adds three units with one click on +3", () => {
    render(<ProductQuantityPicker product={bananas} onAdd={fn()} />);
    click("Add three");
    expect(qty()).toHaveTextContent("4");
  });

  it("clamps +3 to the stock", () => {
    render(<ProductQuantityPicker product={withStock(5)} onAdd={fn()} />);
    click("Increase");
    click("Increase"); // 3 of 5
    click("Add three"); // 3 + 3 would be 6
    expect(qty()).toHaveTextContent("5");
  });

  it("disables + and +3 at the stock limit", () => {
    render(<ProductQuantityPicker product={withStock(2)} onAdd={fn()} />);
    click("Increase");
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add three" })).toBeDisabled();
  });

  it("calls onAdd with the chosen quantity, resets to 1 and counts it once confirmed", async () => {
    const request = deferred();
    const onAdd = fn(() => request.promise);
    render(<ProductQuantityPicker product={bananas} onAdd={onAdd} />);
    click("Add three"); // 4
    click("Add to cart");
    expect(onAdd).toHaveBeenCalledWith(bananas, 4);
    expect(qty()).toHaveTextContent("1");
    expect(addedTotal()).toHaveTextContent("0"); // not confirmed yet

    await act(async () => request.resolve());
    expect(addedTotal()).toHaveTextContent("4");
  });

  it("sums overlapping additions instead of overwriting the counter", async () => {
    const first = deferred();
    const second = deferred();
    const onAdd = fn();
    onAdd.mockImplementation((product, n) => (n === 2 ? first.promise : second.promise));
    render(<ProductQuantityPicker product={bananas} onAdd={onAdd} />);

    click("Increase"); // 2
    click("Add to cart"); // pending request for 2, picker resets to 1
    click("Add to cart"); // pending request for 1

    await act(async () => first.resolve());
    await act(async () => second.resolve());
    expect(addedTotal()).toHaveTextContent("3");
  });

  it("sums overlapping additions in any confirmation order", async () => {
    const first = deferred();
    const second = deferred();
    const onAdd = fn();
    onAdd.mockImplementation((product, n) => (n === 2 ? first.promise : second.promise));
    render(<ProductQuantityPicker product={bananas} onAdd={onAdd} />);

    click("Increase");
    click("Add to cart");
    click("Add to cart");

    await act(async () => second.resolve()); // the later request confirms first
    await act(async () => first.resolve());
    expect(addedTotal()).toHaveTextContent("3");
  });
});
