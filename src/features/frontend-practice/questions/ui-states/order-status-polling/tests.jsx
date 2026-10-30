import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { deferred } from "./testing/utils";
import OrderStatusCard from "./src/components/OrderStatusCard";

const order = (status) => ({ id: "o-1", status, eta: "soon", items: [{ name: "Organic Bananas", quantity: 2 }] });
const FAIL = Symbol("fail");

// A scripted fetcher: each call returns the next step (the last step repeats).
// Steps are an order, null, FAIL, or a deferred (resolved by the test).
const scripted = (...steps) => {
  let i = 0;
  return fn(() => {
    const step = steps[Math.min(i++, steps.length - 1)];
    if (step === FAIL) return Promise.reject(new Error("Network Error"));
    if (step && step.promise) return step.promise;
    return Promise.resolve(step);
  });
};

const INTERVAL = 25;
const show = (fetcher) => render(<OrderStatusCard orderId="o-1" fetcher={fetcher} intervalMs={INTERVAL} />);
const skeleton = () => screen.queryByRole("status", { name: "Loading order" });
const calls = (fetcher) => fetcher.mock.calls.length;
const settle = (ms) =>
  act(async () => {
    await sleep(ms);
  });

describe("OrderStatusCard polling", () => {
  it("shows a skeleton first, then the order", async () => {
    const first = deferred();
    show(scripted(first));
    expect(skeleton()).toBeInTheDocument();
    await act(async () => first.resolve(order("Placed")));
    expect(skeleton()).not.toBeInTheDocument();
    expect(screen.getByText("Placed")).toBeInTheDocument();
  });

  it("shows the new status after a refresh without showing the skeleton again", async () => {
    const second = deferred();
    const fetcher = scripted(order("Placed"), second);
    show(fetcher);
    await screen.findByText("Placed");
    await waitFor(() => expect(calls(fetcher)).toBe(2)); // the refresh is now in flight
    await settle(30); // let React render the refreshing state
    expect(skeleton()).not.toBeInTheDocument();
    expect(screen.getByText("Placed")).toBeInTheDocument();
    expect(screen.getByText("Updating…")).toBeInTheDocument();
    await act(async () => second.resolve(order("Packed")));
    expect(screen.getByText("Packed")).toBeInTheDocument();
    expect(screen.queryByText("Updating…")).not.toBeInTheDocument();
  });

  it("stops polling once the order reaches a terminal status", async () => {
    const fetcher = scripted(order("Placed"), order("Delivered"));
    show(fetcher);
    await screen.findByText("Delivered");
    await settle(60);
    const settled = calls(fetcher);
    await settle(200);
    expect(calls(fetcher)).toBe(settled);
    expect(settled).toBe(2);
  });

  it("stops polling when the component is unmounted", async () => {
    const fetcher = scripted(order("Placed"));
    const { unmount } = show(fetcher);
    await screen.findByText("Placed");
    await settle(60);
    unmount();
    const atUnmount = calls(fetcher);
    await settle(200);
    expect(calls(fetcher)).toBe(atUnmount);
  });

  it("ignores a response that arrives after unmount", async () => {
    const pending = deferred();
    const { unmount } = show(scripted(pending));
    unmount();
    await act(async () => pending.resolve(order("Placed")));
    expect(screen.queryByText("Placed")).not.toBeInTheDocument();
  });

  it("keeps the last order and shows a retry banner when a refresh fails", async () => {
    const fetcher = scripted(order("Packed"), FAIL);
    show(fetcher);
    await screen.findByText("Packed");
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't refresh the status");
    expect(screen.getByText("Packed")).toBeInTheDocument();
    expect(screen.getByText("Organic Bananas × 2")).toBeInTheDocument();
    expect(skeleton()).not.toBeInTheDocument();
  });

  it("recovers from a failed refresh on its own: the banner goes away after a good response", async () => {
    show(scripted(order("Placed"), FAIL, order("Out for Delivery")));
    await screen.findByText("Placed");
    await screen.findByText("Out for Delivery");
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("shows an error with a Try again button when the first load fails, and recovers on retry", async () => {
    const fetcher = scripted(FAIL, order("Placed"));
    show(fetcher);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load your order");
    await settle(120);
    expect(calls(fetcher)).toBe(1); // no hammering while the shopper has not asked
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Placed")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a not found message (and stops polling) when the order does not exist", async () => {
    const fetcher = scripted(null);
    show(fetcher);
    expect(await screen.findByText("We couldn't find this order")).toBeInTheDocument();
    await settle(150);
    expect(calls(fetcher)).toBe(1);
  });
});
