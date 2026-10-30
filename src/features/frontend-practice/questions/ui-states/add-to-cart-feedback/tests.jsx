import { act, fireEvent, render, screen } from "@testing-library/react";
import { deferred } from "./testing/utils";
import AddToCartButton from "./src/components/AddToCartButton";
import { products } from "./src/data/products";

const product = products[0];
const button = () => screen.getByRole("button");
const flush = () => act(async () => {});

describe("AddToCartButton", () => {
  it("shows Adding… and disables the button while the request is pending", async () => {
    const request = deferred();
    render(<AddToCartButton product={product} onAdd={() => request.promise} />);
    fireEvent.click(button());
    await flush();
    expect(button()).toHaveTextContent("Adding…");
    expect(button()).toBeDisabled();
    request.resolve();
    await flush();
  });

  it("sends only one request when the shopper clicks again while pending", async () => {
    const request = deferred();
    const onAdd = fn(() => request.promise);
    render(<AddToCartButton product={product} onAdd={onAdd} />);
    fireEvent.click(button());
    fireEvent.click(button());
    await flush();
    expect(onAdd).toHaveBeenCalledTimes(1);
    request.resolve();
    await flush();
  });

  it("shows Added ✓ after success and returns to Add to cart after resetMs", async () => {
    render(<AddToCartButton product={product} onAdd={async () => {}} resetMs={60} />);
    fireEvent.click(button());
    await flush();
    expect(button()).toHaveTextContent("Added ✓");
    await act(async () => sleep(200));
    expect(button()).toHaveTextContent("Add to cart");
  });

  it("shows a retry state when onAdd rejects and lets the shopper retry", async () => {
    const attempts = [deferred(), deferred()];
    let n = 0;
    const onAdd = fn(() => attempts[n++].promise);
    render(<AddToCartButton product={product} onAdd={onAdd} resetMs={500} />);

    fireEvent.click(button());
    await flush();
    await act(async () => attempts[0].reject(new Error("boom")));
    expect(button()).toHaveTextContent("Couldn't add — retry");
    expect(button()).toBeEnabled();

    fireEvent.click(button());
    await flush();
    expect(button()).toHaveTextContent("Adding…");
    await act(async () => attempts[1].resolve());
    expect(button()).toHaveTextContent("Added ✓");
    expect(onAdd).toHaveBeenCalledTimes(2);
  });

  it("restarts the countdown when a second success arrives: an old timer must not reset it", async () => {
    render(<AddToCartButton product={product} onAdd={async () => {}} resetMs={300} />);
    fireEvent.click(button());
    await flush();
    expect(button()).toHaveTextContent("Added ✓");

    await act(async () => sleep(200)); // first timer would fire at 300ms
    fireEvent.click(button());
    await flush();
    expect(button()).toHaveTextContent("Added ✓");

    await act(async () => sleep(200)); // t = 400ms: past the FIRST timer, before the second (≈500ms)
    expect(button()).toHaveTextContent("Added ✓");
    await act(async () => sleep(300));
    expect(button()).toHaveTextContent("Add to cart");
  });

  it("cancels the pending reset timer on unmount", async () => {
    const realSet = globalThis.setTimeout;
    const realClear = globalThis.clearTimeout;
    const created = [];
    const cleared = [];
    globalThis.setTimeout = (cb, ms, ...rest) => {
      const id = realSet(cb, ms, ...rest);
      if (ms === 4321) created.push(id);
      return id;
    };
    globalThis.clearTimeout = (id) => {
      cleared.push(id);
      return realClear(id);
    };
    try {
      const { unmount } = render(<AddToCartButton product={product} onAdd={async () => {}} resetMs={4321} />);
      fireEvent.click(button());
      await flush();
      expect(created).toHaveLength(1);
      unmount();
      expect(cleared).toContain(created[0]);
    } finally {
      globalThis.setTimeout = realSet;
      globalThis.clearTimeout = realClear;
    }
  });

  it("does not update after unmount when the request finishes later", async () => {
    const request = deferred();
    const { unmount } = render(<AddToCartButton product={product} onAdd={() => request.promise} resetMs={50} />);
    fireEvent.click(button());
    await flush();
    unmount();
    expect(consoleErrors()).toEqual([]);
    await act(async () => request.resolve());
    await act(async () => sleep(120));
    expect(consoleErrors()).toEqual([]);
  });
});
