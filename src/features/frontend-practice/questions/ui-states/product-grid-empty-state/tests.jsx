import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "./testing/utils";
import ProductGrid from "./src/components/ProductGrid";
import { products } from "./src/data/products";

const show = (props = {}) => renderWithRouter(<ProductGrid products={products} {...props} />);

describe("ProductGrid empty state", () => {
  it("lists the products that match the filters", () => {
    show({ category: "bakery" });
    expect(screen.getByText("Sourdough Loaf")).toBeInTheDocument();
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
    expect(screen.queryByText("No Products Found")).not.toBeInTheDocument();
  });

  it("shows No Products Found when the filters match nothing", () => {
    show({ searchQuery: "no-such-item" });
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("shows No Products Found for an empty catalogue", () => {
    renderWithRouter(<ProductGrid products={[]} />);
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("shows No Products Found when the price cap is below every product", () => {
    show({ maxPrice: 0.5 });
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
  });

  it("announces the empty state to screen readers (role=status)", () => {
    show({ searchQuery: "no-such-item" });
    expect(screen.getByRole("status")).toHaveTextContent("No Products Found");
  });

  it("calls onResetFilters once when Clear All Filters is clicked", () => {
    const onReset = fn();
    show({ searchQuery: "no-such-item", onResetFilters: onReset });
    fireEvent.click(screen.getByRole("button", { name: "Clear All Filters" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("hides Clear All Filters when no reset handler is provided", () => {
    // The Featured row renders the grid without onResetFilters.
    renderWithRouter(<ProductGrid products={[]} />);
    expect(screen.getByText("No Products Found")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear All Filters" })).not.toBeInTheDocument();
  });
});
