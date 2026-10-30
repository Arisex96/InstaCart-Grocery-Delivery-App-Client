import { render, screen } from "@testing-library/react";
import PriceTag from "./src/components/PriceTag";

// Tests describe the contract in the UI requirements (text, <del>, aria-hidden, sr-only), not class names.
const tag = (over = {}) =>
  render(<PriceTag product={{ price: 1.2, originalPrice: 1.2, discount: 0, unit: "1 lb", ...over }} />);

describe("PriceTag", () => {
  it("formats the price with two decimals", () => {
    tag({ price: 1.2 });
    expect(screen.getByText("$1.20")).toBeInTheDocument();
  });

  it("strikes through the original price and shows the percent badge when discounted", () => {
    const { container } = tag({ price: 3.5, originalPrice: 4.4, discount: 20, unit: "1 gal" });
    expect(container.querySelector("del")).toHaveTextContent("$4.40");
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
    expect(screen.getByText("$3.50")).toBeInTheDocument();
  });

  it("shows no strike-through or badge without a discount", () => {
    const { container } = tag({ price: 2, originalPrice: 2, discount: 0 });
    expect(container.querySelector("del")).toBeNull();
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  });

  it("ignores a discount when the original price is not higher (bad data)", () => {
    const { container } = tag({ price: 5, originalPrice: 2, discount: 10 });
    expect(screen.getByText("$5.00")).toBeInTheDocument();
    expect(container.querySelector("del")).toBeNull();
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    expect(screen.getByText("Price $5.00")).toBeInTheDocument();
  });

  it("shows the price per unit", () => {
    const { unmount } = tag({ price: 4.8, originalPrice: 4.8, unit: "2 lb" });
    expect(screen.getByText("$2.40 / lb")).toBeInTheDocument();
    unmount();
    tag({ price: 4.99, originalPrice: 4.99, unit: "12 pk" });
    expect(screen.getByText("$0.42 / pk")).toBeInTheDocument();
  });

  it("falls back to the whole unit label when it has no leading number", () => {
    tag({ price: 2, originalPrice: 2, unit: "each" });
    expect(screen.getByText("$2.00 / each")).toBeInTheDocument();
  });

  it("shows Free instead of $0.00 and no per-unit line", () => {
    tag({ price: 0, originalPrice: 3, discount: 100, unit: "each" });
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
    expect(screen.queryByText(/ \/ each/)).not.toBeInTheDocument();
  });

  it("announces the price to screen readers and hides the visual parts", () => {
    const { container, unmount } = tag({ price: 3.5, originalPrice: 4.4, discount: 20, unit: "1 gal" });
    expect(screen.getByText("Now $3.50, was $4.40, 20% off")).toBeInTheDocument();
    expect(screen.getByText("$3.50").closest('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector("del").closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText("20% OFF").closest('[aria-hidden="true"]')).not.toBeNull();
    unmount();
    tag({ price: 1.2, originalPrice: 1.2, discount: 0 });
    expect(screen.getByText("Price $1.20")).toBeInTheDocument();
  });
});
