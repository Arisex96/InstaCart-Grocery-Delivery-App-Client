import { act, render, screen } from "@testing-library/react";
import { deferred } from "./testing/utils";
import ProductDetail from "./src/components/ProductDetail";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// Every api.get call parks on a promise the test resolves by hand. Like axios, a request whose
// signal is aborted rejects with a CanceledError.
const realGet = api.get;
let requests;

const canceled = () => {
  const error = new Error("canceled");
  error.name = "CanceledError";
  error.code = "ERR_CANCELED";
  return error;
};

beforeEach(() => {
  requests = [];
  api.get = (url, options = {}) => {
    const request = deferred();
    const entry = { url, signal: options.signal, request };
    requests.push(entry);
    if (options.signal) options.signal.addEventListener("abort", () => request.reject(canceled()));
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
});

const productFor = (url) => serverProducts.find((p) => p.id === url.split("/").pop());
const respond = (entry) =>
  act(async () => {
    entry.request.resolve({ data: { product: productFor(entry.url) } });
  });
const fail = (entry, error) =>
  act(async () => {
    entry.request.reject(error);
  });
const forUrl = (id) => requests.filter((r) => r.url === `/products/${id}`).pop();

describe("ProductDetail", () => {
  it("shows a loading message, then the product", async () => {
    render(<ProductDetail productId="p1" />);
    expect(screen.getByText("Loading product…")).toBeInTheDocument();
    await respond(forUrl("p1"));
    expect(screen.getByRole("heading", { name: "Organic Bananas" })).toBeInTheDocument();
    expect(screen.queryByText("Loading product…")).not.toBeInTheDocument();
  });

  it("passes an abort signal to api.get", () => {
    render(<ProductDetail productId="p1" />);
    expect(forUrl("p1").signal).toBeDefined();
    expect(forUrl("p1").signal.aborted).toBe(false);
  });

  it("aborts the in-flight request when productId changes", () => {
    const view = render(<ProductDetail productId="p1" />);
    const first = forUrl("p1");
    view.rerender(<ProductDetail productId="p2" />);
    expect(first.signal?.aborted).toBe(true);
    expect(forUrl("p2").signal?.aborted).toBe(false);
  });

  it("aborts the in-flight request when the component unmounts", () => {
    const view = render(<ProductDetail productId="p1" />);
    const first = forUrl("p1");
    view.unmount();
    expect(first.signal?.aborted).toBe(true);
  });

  it("shows the latest product even when an older response arrives last", async () => {
    const view = render(<ProductDetail productId="p1" />);
    const first = forUrl("p1");
    view.rerender(<ProductDetail productId="p2" />);
    await respond(forUrl("p2"));
    await respond(first); // the OLD request finishes last
    expect(screen.getByRole("heading", { name: "Whole Milk" })).toBeInTheDocument();
    expect(screen.queryByText("Organic Bananas")).not.toBeInTheDocument();
  });

  it("does not report a canceled request as an error", async () => {
    const view = render(<ProductDetail productId="p1" />);
    const first = forUrl("p1");
    view.rerender(<ProductDetail productId="p2" />);
    await fail(first, canceled()); // whatever aborted it, the old request rejects as canceled
    expect(screen.queryByText("Could not load product")).not.toBeInTheDocument();
    expect(screen.getByText("Loading product…")).toBeInTheDocument();
    await respond(forUrl("p2"));
    expect(screen.getByRole("heading", { name: "Whole Milk" })).toBeInTheDocument();
  });

  it("still shows an error for a real failure", async () => {
    render(<ProductDetail productId="p1" />);
    const error = new Error("Request failed with status code 500");
    error.response = { status: 500 };
    await fail(forUrl("p1"), error);
    expect(screen.getByText("Could not load product")).toBeInTheDocument();
    expect(screen.queryByText("Loading product…")).not.toBeInTheDocument();
  });
});
