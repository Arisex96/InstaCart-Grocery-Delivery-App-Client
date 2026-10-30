import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { deferred } from "./testing/utils";
import SearchSuggestions from "./src/components/SearchSuggestions";
import api from "./src/api/axios";
import { serverProducts } from "./src/data/products";

// api.get calls park on promises the test resolves by hand, keyed by the search text.
// Tests check the ARIA/behaviour contract from the spec, not class names or markup.
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

const requested = (query) => waitFor(() => expect(pending[query]).toBeDefined());
const respond = (query, ids) =>
  act(async () => {
    pending[query].resolve({ data: { products: serverProducts.filter((p) => ids.includes(p.id)) } });
  });
const input = () => screen.getByRole("combobox", { name: "Search products" });
const options = () => screen.queryAllByRole("option");
const BA = ["p1", "p9", "p11"]; // Organic Bananas, Dark Chocolate Bar, Basmati Rice

/** Types the query, waits for its (parked) request and answers it. */
async function search(user, text, ids) {
  await user.type(input(), text);
  await requested(text);
  await respond(text, ids);
}

describe("SearchSuggestions", () => {
  it("exposes a collapsed combobox until the shopper types", () => {
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(input()).toHaveAttribute("aria-autocomplete", "list");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens a listbox wired to the combobox with at most 5 options", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);
    await search(user, "a", ["p1", "p2", "p3", "p4", "p5", "p6", "p7"]);

    const listbox = screen.getByRole("listbox");
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(input().getAttribute("aria-controls")).toBe(listbox.id);
    expect(options()).toHaveLength(5);
    expect(options()[0]).toHaveTextContent("Organic Bananas");
    expect(options()[0]).toHaveTextContent("$1.20");
  });

  it("bolds the matching part of each name and keeps its capitalisation", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);
    await search(user, "ban", ["p1"]);
    const strong = within(options()[0]).getByText("Ban", { selector: "strong" });
    expect(strong).toBeInTheDocument();
    expect(options()[0]).toHaveTextContent("Organic Bananas");
  });

  it("moves the active option with the arrow keys, wraps around and tracks aria-activedescendant", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);
    await search(user, "ba", BA);
    expect(input()).not.toHaveAttribute("aria-activedescendant");

    await user.keyboard("{ArrowDown}");
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    expect(input().getAttribute("aria-activedescendant")).toBe(options()[0].id);

    await user.keyboard("{ArrowDown}");
    expect(options()[1]).toHaveAttribute("aria-selected", "true");
    expect(options()[0]).toHaveAttribute("aria-selected", "false");
    expect(input().getAttribute("aria-activedescendant")).toBe(options()[1].id);

    await user.keyboard("{ArrowUp}{ArrowUp}"); // back to first, then wrap to last
    expect(options()[2]).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}"); // wraps to first
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
  });

  it("selects the active option on Enter: calls onSelect, fills the input and closes", async () => {
    const user = userEvent.setup();
    const onSelect = fn();
    render(<SearchSuggestions debounceMs={10} onSelect={onSelect} />);
    await search(user, "ba", BA);

    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].id).toBe("p9");
    expect(input()).toHaveValue("Dark Chocolate Bar");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does nothing on Enter when no option is active", async () => {
    const user = userEvent.setup();
    const onSelect = fn();
    render(<SearchSuggestions debounceMs={10} onSelect={onSelect} />);
    await search(user, "ba", BA);
    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
    expect(options()).toHaveLength(3);
  });

  it("closes on Escape and reopens when the shopper types again", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);
    await search(user, "ba", BA);

    await user.keyboard("{Escape}");
    expect(input()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.type(input(), "n");
    await requested("ban");
    await respond("ban", ["p1"]);
    expect(input()).toHaveAttribute("aria-expanded", "true");
    expect(options()).toHaveLength(1);
  });

  it("shows Searching…, No matches and Could not load suggestions rows", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);

    await user.type(input(), "zzz");
    await requested("zzz");
    expect(screen.getByText("Searching…")).toBeInTheDocument();
    await respond("zzz", []);
    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(options()).toHaveLength(0);

    await user.clear(input());
    await user.type(input(), "oops");
    await requested("oops");
    await act(async () => {
      pending.oops.reject(new Error("Network Error"));
    });
    expect(screen.getByText("Could not load suggestions")).toBeInTheDocument();
  });

  it("ignores a stale response that arrives after a newer query", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);

    await user.type(input(), "ba");
    await requested("ba");
    await user.type(input(), "nana");
    await requested("banana");

    await respond("banana", ["p1"]);
    await respond("ba", BA); // the OLDER request answers last
    expect(options().map((o) => o.textContent)).toEqual(["Organic Bananas$1.20"]);
  });

  it("keeps the dropdown closed for blank input and trims the search text", async () => {
    const user = userEvent.setup();
    render(<SearchSuggestions debounceMs={10} onSelect={fn()} />);
    await user.type(input(), "   ");
    await sleep(60);
    expect(Object.keys(pending)).toHaveLength(0);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.type(input(), "eggs ");
    await requested("eggs");
  });
});
