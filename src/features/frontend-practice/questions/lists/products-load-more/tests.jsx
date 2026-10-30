import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { deferred } from "./testing/utils";
import LoadMoreProducts from "./src/components/LoadMoreProducts";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// Every api.get call parks on a promise that the test resolves by hand.
const realGet = api.get;
let calls;

beforeEach(() => {
  calls = [];
  api.get = (url, options) => {
    const request = deferred();
    calls.push({ params: options.params, ...request });
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
});

const ids = (...n) => n.map((i) => "p" + i);
const respond = (call, productIds, hasMore = true) =>
  act(async () => {
    call.resolve({ data: { products: serverProducts.filter((p) => productIds.includes(p.id)), hasMore } });
  });
const waitCalls = async (count) => {
  for (let i = 0; i < 50 && calls.length < count; i++) await act(async () => sleep(10));
  expect(calls.length).toBeGreaterThanOrEqual(count);
};
const names = () => screen.queryAllByRole("listitem").map((li) => li.querySelector("p").textContent);
const loadMoreButton = () => screen.getByRole("button");

describe("LoadMoreProducts", () => {
  it("requests page 1 on mount and shows the products with a Load more button", async () => {
    render(<LoadMoreProducts pageSize={2} />);
    await waitCalls(1);
    expect(calls[0].params).toEqual({ category: "all", page: 1, limit: 2 });
    await respond(calls[0], ids(1, 2));
    expect(names()).toEqual(["Organic Bananas", "Whole Milk"]);
    expect(loadMoreButton()).toHaveTextContent("Load more");
  });

  it("appends the next page when Load more is clicked", async () => {
    render(<LoadMoreProducts pageSize={2} />);
    await waitCalls(1);
    await respond(calls[0], ids(1, 2));
    fireEvent.click(loadMoreButton());
    await waitCalls(2);
    expect(calls[1].params.page).toBe(2);
    await respond(calls[1], ids(3, 4));
    expect(names()).toEqual(["Organic Bananas", "Whole Milk", "Hass Avocados", "Butter Croissant 100g"]);
  });

  it("requests each page only once when Load more is clicked twice quickly", async () => {
    render(<LoadMoreProducts pageSize={2} />);
    await waitCalls(1);
    await respond(calls[0], ids(1, 2));
    fireEvent.click(loadMoreButton());
    fireEvent.click(loadMoreButton());
    await act(async () => sleep(30));
    expect(calls.filter((c) => c.params.page === 2)).toHaveLength(1);
    await respond(calls[1], ids(3, 4));
    const list = names();
    expect(new Set(list).size).toBe(list.length);
    expect(consoleErrors().filter((m) => /same key|unique "key"/i.test(m))).toEqual([]);
  });

  it("replaces Load more with No more products when hasMore is false", async () => {
    render(<LoadMoreProducts pageSize={2} />);
    await waitCalls(1);
    await respond(calls[0], ids(1, 2), false);
    expect(screen.getByText("No more products")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("resets the list and requests page 1 when the category changes", async () => {
    const { rerender } = render(<LoadMoreProducts category="all" pageSize={2} />);
    await waitCalls(1);
    await respond(calls[0], ids(1, 2));
    fireEvent.click(loadMoreButton());
    await waitCalls(2);
    await respond(calls[1], ids(3, 4));

    rerender(<LoadMoreProducts category="bakery" pageSize={2} />);
    await waitCalls(3);
    expect(calls[2].params).toEqual({ category: "bakery", page: 1, limit: 2 });
    expect(names()).toEqual([]);
    await respond(calls[2], ids(4, 5), false);
    expect(names()).toEqual(["Butter Croissant 100g", "Sourdough Loaf"]);
  });

  it("ignores a response that belongs to an outdated category", async () => {
    const { rerender } = render(<LoadMoreProducts category="all" pageSize={2} />);
    await waitCalls(1);
    rerender(<LoadMoreProducts category="bakery" pageSize={2} />);
    await waitCalls(2);

    await respond(calls[1], ids(4, 5)); // bakery answers first
    await respond(calls[0], ids(1, 2)); // the stale "all" page arrives late
    expect(names()).toEqual(["Butter Croissant 100g", "Sourdough Loaf"]);
    expect(within(document.body).queryByText("Organic Bananas")).not.toBeInTheDocument();
  });

  it("shows an error with a Retry that repeats the same page, then continues", async () => {
    render(<LoadMoreProducts pageSize={2} />);
    await waitCalls(1);
    await respond(calls[0], ids(1, 2));
    fireEvent.click(loadMoreButton());
    await waitCalls(2);
    await act(async () => calls[1].reject(new Error("offline")));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load more products.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitCalls(3);
    expect(calls[2].params.page).toBe(2); // same page, not 3
    await respond(calls[2], ids(3, 4));
    expect(names()).toHaveLength(4);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
