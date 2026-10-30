import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { deferred } from "./testing/utils";
import useWishlist from "./src/hooks/useWishlist";
import WishlistPanel from "./src/components/WishlistPanel";
import api from "./src/api/axios";
import { products } from "./src/data/products";

const [bananas, milk] = products; // p1, p2

// Every api.put parks on a promise the test settles by hand.
const realPut = api.put;
let syncs;
beforeEach(() => {
  syncs = [];
  api.put = (url, body) => {
    const request = deferred();
    syncs.push({ url, body, ...request });
    return request.promise;
  };
});
afterEach(() => {
  api.put = realPut;
});

const tap = (result, id) =>
  act(async () => {
    result.current.toggle(id);
  });

describe("useWishlist", () => {
  it("wishes a product immediately and syncs it with the api", async () => {
    const { result } = renderHook(() => useWishlist());
    await tap(result, "p1");
    expect(result.current.ids).toEqual(["p1"]);
    expect(result.current.count).toBe(1);
    expect(syncs[0].url).toBe("/wishlist/p1");
    expect(syncs[0].body).toEqual({ wished: true });
  });

  it("keeps earlier items when a second product is toggled", async () => {
    const { result } = renderHook(() => useWishlist());
    await tap(result, "p1");
    await tap(result, "p2");
    expect(result.current.ids).toEqual(["p1", "p2"]);
    expect(result.current.isWished("p1")).toBe(true);
  });

  it("removes a wished product when it is toggled off again", async () => {
    const { result } = renderHook(() => useWishlist());
    await tap(result, "p1");
    await tap(result, "p1");
    expect(result.current.ids).toEqual([]);
    expect(syncs[1].body).toEqual({ wished: false });
  });

  it("rolls back only the failed product and exposes an error message", async () => {
    const { result } = renderHook(() => useWishlist());
    await tap(result, "p1");
    await tap(result, "p2");
    await act(async () => {
      syncs[1].reject(new Error("500"));
    });
    expect(result.current.ids).toEqual(["p1"]);
    expect(result.current.error).toMatch(/Could not update/);
  });

  it("rolls a failed removal back by wishing the product again", async () => {
    const { result } = renderHook(() => useWishlist());
    await tap(result, "p1");
    await act(async () => {
      syncs[0].resolve({ data: {} });
    });
    await tap(result, "p1"); // un-wish, optimistic
    expect(result.current.ids).toEqual([]);
    await act(async () => {
      syncs[1].reject(new Error("500"));
    });
    expect(result.current.ids).toEqual(["p1"]);
  });

  it("clears the error after a later successful sync", async () => {
    const { result } = renderHook(() => useWishlist());
    await tap(result, "p1");
    await act(async () => {
      syncs[0].reject(new Error("500"));
    });
    expect(result.current.error).toBeTruthy();
    await tap(result, "p2");
    await act(async () => {
      syncs[1].resolve({ data: {} });
    });
    expect(result.current.error).toBeNull();
  });
});

describe("WishlistPanel", () => {
  it("shows an empty message when nothing is wished", () => {
    render(<WishlistPanel products={[]} onRemove={fn()} />);
    expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
  });

  it("lists products sorted by name, each with a remove button", () => {
    const onRemove = fn();
    render(<WishlistPanel products={[milk, bananas]} onRemove={onRemove} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Organic Bananas");
    expect(rows[1]).toHaveTextContent("Whole Milk");
    fireEvent.click(screen.getByRole("button", { name: "Remove Whole Milk from wishlist" }));
    expect(onRemove).toHaveBeenCalledWith("p2");
  });

  it("does not reorder the array it was given", () => {
    const input = [milk, bananas];
    render(<WishlistPanel products={input} onRemove={fn()} />);
    expect(input.map((p) => p._id)).toEqual(["p2", "p1"]);
  });
});
