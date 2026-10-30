import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import Breadcrumbs from "./src/components/Breadcrumbs";

const Where = () => {
  const location = useLocation();
  return <output data-testid="where">{location.pathname + location.search}</output>;
};

const show = (props) =>
  render(
    <MemoryRouter initialEntries={["/product/p4"]}>
      <Breadcrumbs {...props} />
      <Where />
    </MemoryRouter>,
  );
const where = () => screen.getByTestId("where").textContent;

describe("Breadcrumbs", () => {
  it("is a navigation landmark named Breadcrumb", () => {
    show({ activeCategory: "bakery" });
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("shows the catalogue name for a known category slug", () => {
    show({ activeCategory: "bakery" });
    expect(screen.getByRole("button", { name: "Bakery" })).toBeInTheDocument();
  });

  it("shows All Products for the all category and links to /products without a query", () => {
    show({});
    fireEvent.click(screen.getByRole("button", { name: "All Products" }));
    expect(where()).toBe("/products");
  });

  it("falls back to the raw slug when the catalogue does not know the category", () => {
    show({ activeCategory: "seasonal-specials" });
    expect(screen.getByRole("button", { name: "seasonal-specials" })).toBeInTheDocument();
  });

  it("lets an explicit activeCategoryLabel win over the lookup", () => {
    show({ activeCategory: "seasonal-specials", activeCategoryLabel: "Fresh Bakes" });
    expect(screen.getByRole("button", { name: "Fresh Bakes" })).toBeInTheDocument();
  });

  it("navigates to /products?category=<slug> from the category crumb and / from Home", () => {
    show({ activeCategory: "bakery" });
    fireEvent.click(screen.getByRole("button", { name: "Bakery" }));
    expect(where()).toBe("/products?category=bakery");
    fireEvent.click(screen.getByRole("button", { name: /Home/ }));
    expect(where()).toBe("/");
  });

  it("renders the product name as the current page, not as a button", () => {
    show({ activeCategory: "bakery", activeProductName: "Butter Croissant 100g" });
    const current = screen.getByText("Butter Croissant 100g");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { name: "Butter Croissant 100g" })).not.toBeInTheDocument();
  });

  it("ends the trail at the category when there is no product", () => {
    show({ activeCategory: "bakery" });
    expect(document.querySelector("[aria-current]")).toBeNull();
  });
});
