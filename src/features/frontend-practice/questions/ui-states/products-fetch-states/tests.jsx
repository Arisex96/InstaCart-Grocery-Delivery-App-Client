import { act, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithRouter, deferred } from "./testing/utils";
import ProductsPage from "./src/pages/ProductsPage";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// Every request parks on a promise the test settles by hand: no timing involved.
const realGet = api.get;
let requests;

beforeEach(() => {
  requests = [];
  api.get = (url, options = {}) => {
    const request = { ...deferred(), params: options.params };
    requests.push(request);
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
});

const waitForRequest = (n) => waitFor(() => expect(requests.length).toBeGreaterThanOrEqual(n));
const succeed = (n, ids) =>
  act(async () => {
    requests[n - 1].resolve({ data: { products: serverProducts.filter((p) => ids.includes(p.id)) } });
  });
const fail = (n) =>
  act(async () => {
    requests[n - 1].reject(new Error("Network Error"));
  });

const show = (category = "all") => renderWithRouter(<ProductsPage category={category} />);

describe("ProductsPage states", () => {
  it("shows a loading state while the first request is pending", async () => {
    show();
    await waitForRequest(1);
    expect(screen.getByRole("status")).toHaveTextContent("Loading products…");
  });

  it("does not show No products found while the request is pending", async () => {
    show();
    await waitForRequest(1);
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();
  });

  it("renders the products once the request succeeds", async () => {
    show();
    await waitForRequest(1);
    await succeed(1, ["p1", "p5"]);
    expect(screen.getByText("Organic Bananas")).toBeInTheDocument();
    expect(screen.getByText("Sourdough Loaf")).toBeInTheDocument();
    expect(screen.queryByText("Loading products…")).not.toBeInTheDocument();
  });

  it("shows No products found only after an empty successful response", async () => {
    show();
    await waitForRequest(1);
    await succeed(1, []);
    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an error with a Retry button when the request fails", async () => {
    show();
    await waitForRequest(1);
    await fail(1);
    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load products.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.queryByText("No products found")).not.toBeInTheDocument();
  });

  it("Retry requests again, shows loading, then the products", async () => {
    show();
    await waitForRequest(1);
    await fail(1);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitForRequest(2);
    expect(screen.getByRole("status")).toHaveTextContent("Loading products…");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await succeed(2, ["p10"]);
    expect(screen.getByText("Free Range Eggs")).toBeInTheDocument();
  });

  it("shows loading again when the category changes and hides the old list", async () => {
    const { rerender } = show("bakery");
    await waitForRequest(1);
    await succeed(1, ["p5"]);
    expect(screen.getByText("Sourdough Loaf")).toBeInTheDocument();

    rerender(<MemoryRouter><ProductsPage category="beverages" /></MemoryRouter>);
    await waitForRequest(2);
    expect(requests[1].params.category).toBe("beverages");
    expect(screen.getByRole("status")).toHaveTextContent("Loading products…");
    expect(screen.queryByText("Sourdough Loaf")).not.toBeInTheDocument();
  });

  it("ignores a response that belongs to a previous category", async () => {
    const { rerender } = show("bakery");
    await waitForRequest(1);
    rerender(<MemoryRouter><ProductsPage category="beverages" /></MemoryRouter>);
    await waitForRequest(2);

    await succeed(2, ["p6"]);
    await succeed(1, ["p5"]); // the older request answers last
    expect(screen.getByText("Sparkling Water")).toBeInTheDocument();
    expect(screen.queryByText("Sourdough Loaf")).not.toBeInTheDocument();
  });
});
