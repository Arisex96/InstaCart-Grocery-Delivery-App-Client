import { act, render, screen } from "@testing-library/react";
import { deferred } from "./testing/utils";
import ProductListing from "./src/components/ProductListing";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

const realGet = api.get;
let calls;

const matches = (params) =>
  serverProducts.filter(
    (p) =>
      (params.category === "all" || p.category === params.category) &&
      (params.maxPrice === "" || p.price <= Number(params.maxPrice)),
  );

beforeEach(() => {
  calls = [];
  // Instant-ish fake server that records every request.
  api.get = async (url, { params }) => {
    calls.push({ url, params: { ...params } });
    await sleep(5);
    return { data: { products: matches(params) } };
  };
});
afterEach(() => {
  api.get = realGet;
});

const names = () => screen.queryAllByRole("listitem").map((li) => li.firstChild.textContent);

describe("ProductListing requests", () => {
  it("requests the products exactly once for the initial filters", async () => {
    render(<ProductListing />);
    await sleep(120);
    expect(calls.length).toBe(1);
    expect(calls[0].url).toBe("/products");
  });

  it("stops requesting once the list is loaded", async () => {
    render(<ProductListing />);
    await sleep(60);
    const settled = calls.length;
    await sleep(120);
    expect(calls.length).toBe(settled);
  });

  it("sends the same params as the Products page", async () => {
    render(<ProductListing category="bakery" maxPrice="3" />);
    await sleep(40);
    expect(calls[0].params).toEqual({ category: "bakery", minPrice: "", maxPrice: "3", sort: "default" });
  });

  it("renders the products returned by the API", async () => {
    render(<ProductListing category="bakery" />);
    await sleep(60);
    expect(names()).toEqual(["Butter Croissant 100g", "Sourdough Loaf"]);
    expect(screen.getByText("2 results")).toBeInTheDocument();
  });

  it("refetches exactly once when the category changes", async () => {
    const { rerender } = render(<ProductListing category="all" />);
    await sleep(80);
    const before = calls.length;
    rerender(<ProductListing category="bakery" />);
    await sleep(120);
    expect(calls.length).toBe(before + 1);
    expect(calls[calls.length - 1].params.category).toBe("bakery");
  });

  it("refetches once when maxPrice changes and not when the parent re-renders with the same filters", async () => {
    const { rerender } = render(<ProductListing category="all" maxPrice="" />);
    await sleep(80);
    const before = calls.length;
    rerender(<ProductListing category="all" maxPrice="" />);
    await sleep(60);
    expect(calls.length).toBe(before);
    rerender(<ProductListing category="all" maxPrice="2" />);
    await sleep(100);
    expect(calls.length).toBe(before + 1);
    expect(names()).toEqual(["Organic Bananas", "Hass Avocados"]);
  });

  it("keeps the newest list when responses arrive out of order", async () => {
    const pending = {};
    api.get = (url, { params }) => {
      const request = deferred();
      (pending[params.category] ??= []).push(request);
      return request.promise;
    };
    const respond = (request, category) =>
      act(async () => {
        request.resolve({ data: { products: matches({ category, maxPrice: "" }) } });
      });

    const { rerender } = render(<ProductListing category="all" />);
    rerender(<ProductListing category="bakery" />);
    // Answer the NEWER request first, then the stale one.
    for (const request of pending.bakery) await respond(request, "bakery");
    for (const request of pending.all) await respond(request, "all");
    expect(names()).toEqual(["Butter Croissant 100g", "Sourdough Loaf"]);
  });
});
