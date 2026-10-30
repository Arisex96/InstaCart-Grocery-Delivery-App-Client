import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import ProductsListing from "./src/components/ProductsListing";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// Every api.get call parks on a promise the test resolves by hand (no timing involved).
// Tests check the UI contract from the spec (roles, labels, text), not class names.
const realGet = api.get;
let calls;

beforeEach(() => {
  calls = [];
  api.get = (url, options = {}) => {
    const request = deferred();
    calls.push({ url, params: options.params, request });
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
});

const inCategory = (c) => serverProducts.filter((p) => c === "all" || p.category === c);
const respond = (i, products) =>
  act(async () => {
    calls[i].request.resolve({ data: { products } });
  });
const fail = (i) =>
  act(async () => {
    calls[i].request.reject(new Error("Network Error"));
  });
const requested = (n) => waitFor(() => expect(calls.length).toBe(n));
const card = (name) => screen.getAllByRole("listitem").find((li) => li.textContent.includes(name));

describe("ProductsListing", () => {
  it("shows a loading status with skeletons until products arrive", async () => {
    render(<ProductsListing />);
    expect(screen.getByRole("status", { name: "Loading products" })).toBeInTheDocument();
    await respond(0, inCategory("all"));
    expect(screen.queryByRole("status", { name: "Loading products" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
  });

  it("does not flash No products found while loading", async () => {
    render(<ProductsListing />);
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();
    await respond(0, inCategory("all"));
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();
  });

  it("renders a card per product with price, struck-through original and badges", async () => {
    render(<ProductsListing />);
    await respond(0, inCategory("all"));

    const milk = card("Whole Milk");
    expect(within(milk).getByRole("heading", { level: 3 })).toHaveTextContent("Whole Milk");
    expect(within(milk).getByText("$3.50")).toBeInTheDocument();
    expect(within(milk).getByText("$4.40").tagName).toBe("DEL");
    expect(within(milk).getByText("20% OFF")).toBeInTheDocument();
    expect(within(milk).queryByText("Out of stock")).not.toBeInTheDocument();

    const avocados = card("Hass Avocados");
    expect(within(avocados).getByText("Out of stock")).toBeInTheDocument();

    const bananas = card("Organic Bananas");
    expect(within(bananas).queryByText(/OFF/)).not.toBeInTheDocument();
    expect(bananas.querySelector("del")).toBeNull();
  });

  it("reports how many products are shown (singular and plural)", async () => {
    const { unmount } = render(<ProductsListing initialCategory="bakery" />);
    await respond(0, inCategory("bakery"));
    expect(screen.getByText("Showing 2 products")).toBeInTheDocument();
    unmount();

    render(<ProductsListing />);
    await respond(1, [serverProducts[0]]);
    expect(screen.getByText("Showing 1 product")).toBeInTheDocument();
  });

  it("refetches with the selected category and shows loading again", async () => {
    const user = userEvent.setup();
    render(<ProductsListing />);
    expect(calls[0].url).toBe("/products");
    expect(calls[0].params.category).toBe("all");
    await respond(0, inCategory("all"));

    const select = screen.getByLabelText("Category");
    expect(select).toHaveValue("all");
    expect(screen.getByRole("option", { name: "All products" })).toBeInTheDocument();
    await user.selectOptions(select, "bakery");
    await requested(2);
    expect(calls[1].params.category).toBe("bakery");
    expect(screen.getByRole("status", { name: "Loading products" })).toBeInTheDocument();

    await respond(1, inCategory("bakery"));
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector("h3").textContent)).toEqual([
      "Butter Croissant 100g",
      "Sourdough Loaf",
    ]);
  });

  it("shows an error with a Retry button that refetches", async () => {
    const user = userEvent.setup();
    render(<ProductsListing />);
    await fail(0);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Could not load products");
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();

    await user.click(within(alert).getByRole("button", { name: "Retry" }));
    await requested(2);
    expect(calls[1].params.category).toBe("all");
    expect(screen.getByRole("status", { name: "Loading products" })).toBeInTheDocument();
    await respond(1, inCategory("all"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
  });

  it("shows No products found with a Clear filters action that resets the category", async () => {
    const user = userEvent.setup();
    render(<ProductsListing initialCategory="bakery" />);
    await respond(0, []);
    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await requested(2);
    expect(calls[1].params.category).toBe("all");
    expect(screen.getByLabelText("Category")).toHaveValue("all");
    await respond(1, inCategory("all"));
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();
  });

  it("ignores a stale response after the category changed", async () => {
    const user = userEvent.setup();
    render(<ProductsListing />);
    await respond(0, inCategory("all"));
    const select = screen.getByLabelText("Category");

    await user.selectOptions(select, "bakery");
    await user.selectOptions(select, "beverages");
    await requested(3);

    await respond(2, inCategory("beverages"));
    await respond(1, inCategory("bakery")); // the OLDER request answers last
    expect(select).toHaveValue("beverages");
    expect(screen.getAllByRole("listitem").map((li) => li.querySelector("h3").textContent)).toEqual([
      "Sparkling Water",
      "Orange Juice",
    ]);
  });
});
