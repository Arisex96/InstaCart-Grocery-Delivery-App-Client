import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { deferred } from "./testing/utils";
import ProductsPage from "./src/pages/ProductsPage";
import Pagination from "./src/components/Pagination";
import api from "./src/api/axios";

// These tests check the contract from the UI requirements (roles, labels, text, URL, requests),
// not class names or DOM structure, so any valid implementation passes.
//
// Every api.get call parks on a promise the test resolves by hand, so each test decides the order
// in which responses arrive. No timing involved (except the short search debounce).
const realGet = api.get;
let calls;

beforeEach(() => {
  calls = [];
  api.__configure({ latency: 0 });
  api.get = (url, options = {}) => {
    const request = deferred();
    calls.push({ url, params: options.params, ...request });
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
  api.__reset();
});

const respond = (call) =>
  act(async () => {
    call.resolve(await realGet(call.url, { params: call.params }));
  });
const fail = (call) =>
  act(async () => {
    call.reject(new Error("Network Error"));
  });
const requested = (n) => waitFor(() => expect(calls.length).toBeGreaterThanOrEqual(n));

function Probe() {
  const location = useLocation();
  return <p data-testid="loc">{location.pathname + location.search}</p>;
}
function History() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate(-1)}>go back</button>
      <button onClick={() => navigate(1)}>go forward</button>
    </>
  );
}

const setup = (entries = ["/products"], { index = entries.length - 1, debounceMs = 100 } = {}) =>
  render(
    <MemoryRouter initialEntries={entries} initialIndex={index}>
      <ProductsPage debounceMs={debounceMs} />
      <Probe />
      <History />
    </MemoryRouter>,
  );

const loc = () => screen.getByTestId("loc").textContent;
const box = () => screen.getByLabelText("Search products");
const itemTexts = () => within(screen.getByRole("list", { name: "Products" })).getAllByRole("listitem").map((li) => li.textContent);
const last = () => calls[calls.length - 1];

describe("ProductsPage data and states", () => {
  it("loads the first 6 products with a count and the page indicator", async () => {
    setup();
    expect(screen.getByRole("status")).toHaveTextContent("Loading products…");
    await requested(1);
    expect(calls[0].url).toBe("/products");
    expect(calls[0].params).toEqual({ category: "all", search: "", sort: "default" });

    await respond(calls[0]);
    expect(screen.queryByText("Loading products…")).not.toBeInTheDocument();
    const items = itemTexts();
    expect(items).toHaveLength(6);
    expect(items[0]).toContain("Organic Bananas");
    expect(items[0]).toContain("$1.20");
    expect(screen.getByText("12 products")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("shows an error with a Try again button that refetches", async () => {
    const user = userEvent.setup();
    setup();
    await requested(1);
    await fail(calls[0]);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load products");

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await requested(2);
    expect(screen.getByRole("status")).toHaveTextContent("Loading products…");
    await respond(calls[1]);
    expect(itemTexts()).toHaveLength(6);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an empty state, without pagination, when nothing matches", async () => {
    setup(["/products?search=zzzz"]);
    await requested(1);
    expect(calls[0].params.search).toBe("zzzz");
    await respond(calls[0]);
    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });

  it("ignores a slow response for old filters: the latest filters win", async () => {
    const user = userEvent.setup();
    setup();
    await requested(1);
    await user.selectOptions(screen.getByLabelText("Category"), "bakery");
    await requested(2);
    expect(calls[1].params.category).toBe("bakery");

    await respond(calls[1]); // the NEWER request answers first
    expect(itemTexts()).toHaveLength(2);
    await respond(calls[0]); // the OLDER request (all products) answers last
    expect(itemTexts()).toHaveLength(2);
    expect(itemTexts().join(" ")).toContain("Sourdough Loaf");
    expect(screen.getByText("2 products")).toBeInTheDocument();
  });
});

describe("ProductsPage pagination and the URL", () => {
  it("reads the page from the URL and shows the second page", async () => {
    setup(["/products?page=2"]);
    await requested(1);
    await respond(calls[0]);
    const items = itemTexts();
    expect(items).toHaveLength(6);
    expect(items[0]).toContain("Orange Juice"); // the 7th product
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("pushes a history entry for page changes without refetching, and Back returns", async () => {
    const user = userEvent.setup();
    setup();
    await requested(1);
    await respond(calls[0]);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(loc()).toBe("/products?page=2");
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(calls).toHaveLength(1); // paging happens on the client

    await user.click(screen.getByRole("button", { name: "go back" }));
    expect(loc()).toBe("/products");
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("pushes a history entry for a category change, resets the page, and Back restores the old filters", async () => {
    const user = userEvent.setup();
    setup(["/products?page=2"]);
    await requested(1);
    await respond(calls[0]);

    await user.selectOptions(screen.getByLabelText("Category"), "bakery");
    expect(loc()).toBe("/products?category=bakery"); // page dropped, category set
    await requested(2);
    expect(last().params.category).toBe("bakery");
    await respond(last());
    expect(itemTexts()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "go back" }));
    expect(loc()).toBe("/products?page=2");
    expect(screen.getByLabelText("Category")).toHaveValue("all");
    await requested(3);
    expect(last().params.category).toBe("all");
    await respond(last());
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("sends the sort to the API, stores it in the URL and omits it again for the default", async () => {
    const user = userEvent.setup();
    setup();
    await requested(1);
    await respond(calls[0]);

    await user.selectOptions(screen.getByLabelText("Sort by"), "price-low");
    expect(loc()).toBe("/products?sort=price-low");
    await requested(2);
    expect(last().params.sort).toBe("price-low");
    await respond(last());
    expect(itemTexts()[0]).toContain("Organic Bananas"); // cheapest first

    await user.selectOptions(screen.getByLabelText("Sort by"), "default");
    expect(loc()).toBe("/products");
  });

  it("treats invalid page params as page 1", async () => {
    for (const bad of ["abc", "0", "-2"]) {
      const { unmount } = setup([`/products?page=${bad}`]);
      await waitFor(() => expect(calls.length).toBeGreaterThan(0));
      await respond(last());
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
      expect(itemTexts()[0]).toContain("Organic Bananas");
      unmount();
      calls = [];
    }
  });

  it("shows the last page for a page beyond the end and corrects the URL", async () => {
    setup(["/products?page=99"]);
    await requested(1);
    await respond(calls[0]);
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    await waitFor(() => expect(loc()).toBe("/products?page=2"));
  });
});

describe("ProductsPage search box", () => {
  it("is debounced, REPLACES the history entry and resets the page", async () => {
    const user = userEvent.setup();
    setup(["/products", "/products?page=2"]);
    await requested(1);
    await respond(calls[0]);

    await user.type(box(), "milk");
    expect(loc()).toBe("/products?page=2"); // not written yet: still typing
    await sleep(350);
    expect(loc()).toBe("/products?search=milk"); // written once, page dropped
    await requested(2);
    expect(last().params.search).toBe("milk");
    await respond(last());
    expect(screen.getByText("1 product")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();

    // The search replaced the page=2 entry, so Back goes to the entry BEFORE it.
    await user.click(screen.getByRole("button", { name: "go back" }));
    expect(loc()).toBe("/products");
  });

  it("mirrors the URL on Back/Forward without re-navigating on its own", async () => {
    const user = userEvent.setup();
    setup(["/products?search=milk", "/products?search=eggs"]);
    expect(box()).toHaveValue("eggs");
    await requested(1);
    await respond(calls[0]);

    await user.click(screen.getByRole("button", { name: "go back" }));
    expect(box()).toHaveValue("milk");
    await sleep(350); // longer than the debounce: nothing may rewrite the URL
    expect(loc()).toBe("/products?search=milk");
    await requested(2);
    expect(last().params.search).toBe("milk");

    await user.click(screen.getByRole("button", { name: "go forward" }));
    expect(box()).toHaveValue("eggs");
    await sleep(350);
    expect(loc()).toBe("/products?search=eggs");
  });
});

describe("Pagination component", () => {
  it("renders nothing when there is a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("is a labelled navigation with the page indicator and two buttons", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={fn()} />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByText("Page 2 of 5")).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(within(nav).getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("calls onPageChange with the neighbouring page and disables the ends", async () => {
    const user = userEvent.setup();
    const onPageChange = fn();
    const { rerender } = render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(3);

    rerender(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
