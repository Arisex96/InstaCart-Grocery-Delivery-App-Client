import { act, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithRouter, deferred } from "./testing/utils";
import ProductListing from "./src/components/ProductListing";
import useCartStore from "./src/store/useCartStore";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// Every api.get call parks on a promise the test settles by hand: no timing involved.
const realGet = api.get;
let requests;

beforeEach(() => {
  requests = [];
  useCartStore.getState().clear_cart();
  api.get = (url, options = {}) => {
    const request = deferred();
    requests.push({ params: options.params, ...request });
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
});

const respond = (index, ids) =>
  act(async () => {
    requests[index].resolve({ data: { products: serverProducts.filter((p) => ids.includes(p.id)) } });
  });
const fail = (index) =>
  act(async () => {
    requests[index].reject(new Error("Network Error"));
  });

describe("ProductListing", () => {
  it("shows the loading indicator, then the products", async () => {
    renderWithRouter(<ProductListing />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading products");
    await respond(0, ["p1", "p2"]);
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("maps the server id to _id so cart actions target the right product", async () => {
    renderWithRouter(<ProductListing />);
    await respond(0, ["p1", "p2"]);
    const buttons = screen.getAllByRole("button", { name: "Add to cart" });
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    const ids = useCartStore.getState().items.map((item) => item.product._id);
    expect(ids).toEqual(["p1", "p2"]);
  });

  it("shows an error message when the request fails", async () => {
    renderWithRouter(<ProductListing />);
    await fail(0);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load products");
  });

  it("stops showing the loading indicator after a failure", async () => {
    renderWithRouter(<ProductListing />);
    await fail(0);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("retry requests the products again and clears the error", async () => {
    renderWithRouter(<ProductListing />);
    await fail(0);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(requests).toHaveLength(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await respond(1, ["p10"]);
    expect(screen.getByText("Free Range Eggs")).toBeInTheDocument();
  });

  it("shows an empty state when the server returns no products", async () => {
    renderWithRouter(<ProductListing />);
    await respond(0, []);
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("requests again with the new category", async () => {
    const view = renderWithRouter(<ProductListing category="all" />);
    await respond(0, ["p1"]);
    view.rerender(
      <MemoryRouter>
        <ProductListing category="bakery" />
      </MemoryRouter>,
    );
    expect(requests[1].params.category).toBe("bakery");
  });

  it("ignores a response that arrives after unmount", async () => {
    const view = renderWithRouter(<ProductListing />);
    view.unmount();
    await respond(0, ["p1"]);
    expect(consoleErrors()).toEqual([]);
  });
});
