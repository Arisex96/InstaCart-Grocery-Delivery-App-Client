import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithRouter } from "./testing/utils";
import PaginatedProducts from "./src/components/PaginatedProducts";
import { products } from "./src/data/products";

// 12 products. With 5 per page: page 1 = items 0-4, page 2 = 5-9, page 3 = 10-11.
const show = (props = {}) => renderWithRouter(<PaginatedProducts products={products} initialPageSize={5} {...props} />);
const visibleCount = () => screen.queryAllByRole("button", { name: /^(Add to cart|Out of stock)$/ }).length;
const next = () => screen.getByRole("button", { name: "Next page" });
const prev = () => screen.getByRole("button", { name: "Previous page" });
const search = (text) => fireEvent.change(screen.getByLabelText("Search products"), { target: { value: text } });
const perPage = (size) => fireEvent.change(screen.getByLabelText("Products per page"), { target: { value: String(size) } });

describe("PaginatedProducts", () => {
  it("renders only one page of products at a time", () => {
    show();
    expect(visibleCount()).toBe(5);
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.queryByText("Sparkling Water")).not.toBeInTheDocument(); // item 6 is on page 2
  });

  it("reports the page count including the last partial page", () => {
    show();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("reaches the last partial page with the remaining products and stops there", () => {
    show();
    fireEvent.click(next());
    fireEvent.click(next());
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("Basmati Rice")).toBeInTheDocument();
    expect(screen.getByText("Extra Virgin Olive Oil")).toBeInTheDocument();
    expect(visibleCount()).toBe(2);
    expect(next()).toBeDisabled();
    expect(prev()).toBeEnabled();
  });

  it("returns to page 1 when the search changes", () => {
    show();
    fireEvent.click(next());
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    search("a");
    expect(screen.getByText(/^Page 1 of \d+$/)).toBeInTheDocument();
    expect(visibleCount()).toBeGreaterThan(0);
  });

  it("clamps the page when the list shrinks while on the last page", () => {
    const { rerender } = show();
    fireEvent.click(next());
    fireEvent.click(next()); // page 3
    rerender(
      <MemoryRouter>
        <PaginatedProducts products={products.slice(0, 7)} initialPageSize={5} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(visibleCount()).toBe(2);
  });

  it("keeps the first visible product on screen when the page size changes", () => {
    show();
    fireEvent.click(next()); // page 2 starts at item 6 (Sparkling Water)
    expect(screen.getByText("Sparkling Water")).toBeInTheDocument();
    perPage(6);
    expect(screen.getByText("Sparkling Water")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    perPage(12);
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(visibleCount()).toBe(12);
  });

  it("exposes accessible pagination controls", () => {
    show();
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav.contains(prev())).toBe(true);
    expect(nav.contains(next())).toBe(true);
    expect(prev()).toBeDisabled();
    expect(screen.getByText("Page 1 of 3")).toHaveAttribute("aria-live", "polite");
  });

  it("shows an empty message and a single disabled page when nothing matches", () => {
    show();
    search("zzzz");
    expect(screen.getByText("No products match your search")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(prev()).toBeDisabled();
    expect(next()).toBeDisabled();
  });
});
