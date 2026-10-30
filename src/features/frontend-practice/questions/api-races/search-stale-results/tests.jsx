import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import ProductSearch from "./src/components/ProductSearch";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// Every api.get call parks on a promise the test resolves by hand, so each test
// decides in which ORDER the responses arrive. No timing involved.
const realGet = api.get;
let pending;

beforeEach(() => {
  pending = {};
  api.get = (url, options = {}) => {
    const request = deferred();
    pending[options.params.search] = request;
    return request.promise;
  };
});
afterEach(() => {
  api.get = realGet;
});

const box = () => screen.getByLabelText("Search products");
const names = () => screen.queryAllByRole("listitem").map((li) => li.firstChild.textContent);
const requested = (query) => waitFor(() => expect(pending[query]).toBeDefined());
const respond = (query, ids) =>
  act(async () => {
    pending[query].resolve({ data: { products: serverProducts.filter((p) => ids.includes(p.id)) } });
  });

const BANANAS = ["p1"];
const BA_RESULTS = ["p1", "p9", "p11"]; // bananas, chocolate bar, basmati rice

describe("ProductSearch", () => {
  it("renders results and hides the loading indicator when the response arrives", async () => {
    const user = userEvent.setup();
    render(<ProductSearch debounceMs={10} />);
    await user.type(box(), "banana");
    await requested("banana");
    expect(screen.getByText("Searching…")).toBeInTheDocument();

    await respond("banana", BANANAS);
    expect(names()).toEqual(["Organic Bananas"]);
    expect(screen.queryByText("Searching…")).not.toBeInTheDocument();
  });

  it("shows results for the latest query even when an older request finishes last", async () => {
    const user = userEvent.setup();
    render(<ProductSearch debounceMs={10} />);

    await user.type(box(), "ba");
    await requested("ba");
    await user.type(box(), "nana");
    await requested("banana");

    await respond("banana", BANANAS);
    await respond("ba", BA_RESULTS); // the OLDER request finishes last
    expect(names()).toEqual(["Organic Bananas"]);
  });

  it("keeps the loading indicator until the latest request finishes", async () => {
    const user = userEvent.setup();
    render(<ProductSearch debounceMs={10} />);

    await user.type(box(), "ba");
    await requested("ba");
    await user.type(box(), "nana");
    await requested("banana");

    await respond("ba", BA_RESULTS); // old request answers while "banana" is still pending
    expect(screen.getByText("Searching…")).toBeInTheDocument();

    await respond("banana", BANANAS);
    expect(screen.queryByText("Searching…")).not.toBeInTheDocument();
    expect(names()).toEqual(["Organic Bananas"]);
  });

  it("stays empty when the box is emptied while a request is in flight", async () => {
    const user = userEvent.setup();
    render(<ProductSearch debounceMs={10} />);

    await user.type(box(), "milk");
    await requested("milk");
    await user.clear(box());
    await sleep(40); // let the debounced empty query run

    await respond("milk", ["p2"]); // the old response arrives after the box was emptied
    expect(names()).toEqual([]);
    expect(screen.queryByText("Searching…")).not.toBeInTheDocument();
  });

  it("shows an error for a failed request and clears it after a successful one", async () => {
    const user = userEvent.setup();
    render(<ProductSearch debounceMs={10} />);

    await user.type(box(), "milk");
    await requested("milk");
    await act(async () => {
      pending.milk.reject(new Error("Network Error"));
    });
    expect(screen.getByText(/Could not load products/)).toBeInTheDocument();

    await user.clear(box());
    await user.type(box(), "eggs");
    await requested("eggs");
    await respond("eggs", ["p10"]);
    expect(names()).toEqual(["Free Range Eggs"]);
    expect(screen.queryByText(/Could not load products/)).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<ProductSearch debounceMs={10} />);
    await user.type(box(), "zzzz");
    await requested("zzzz");
    await respond("zzzz", []);
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });
});
