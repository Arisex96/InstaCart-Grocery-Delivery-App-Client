import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import useEventListener from "./src/hooks/useEventListener";
import CartDrawer from "./src/components/CartDrawer";

// Record every listener added to / removed from window (for the event types used below).
const realAdd = window.addEventListener;
const realRemove = window.removeEventListener;
const WATCHED = ["ping", "pong", "keydown", "mousedown"];
let added;
let removed;

beforeEach(() => {
  added = [];
  removed = [];
  window.addEventListener = function (type, listener, options) {
    if (WATCHED.includes(type)) added.push({ type, listener });
    return realAdd.call(this, type, listener, options);
  };
  window.removeEventListener = function (type, listener, options) {
    if (WATCHED.includes(type)) removed.push({ type, listener });
    return realRemove.call(this, type, listener, options);
  };
});
afterEach(() => {
  window.addEventListener = realAdd;
  window.removeEventListener = realRemove;
});

const ping = (target = window, type = "ping") => target.dispatchEvent(new Event(type));
const countOf = (list, type) => list.filter((entry) => entry.type === type).length;

describe("useEventListener", () => {
  it("calls the latest handler after a re-render", () => {
    const first = fn();
    const second = fn();
    const { rerender } = renderHook(({ handler }) => useEventListener("ping", handler), {
      initialProps: { handler: first },
    });
    rerender({ handler: second });
    ping();
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("does not re-subscribe when only the handler function changes", () => {
    const { rerender } = renderHook(({ handler }) => useEventListener("ping", handler), {
      initialProps: { handler: () => {} },
    });
    rerender({ handler: () => {} });
    rerender({ handler: () => {} });
    expect(countOf(added, "ping")).toBe(1);
  });

  it("removes the very listener it added when it unmounts", () => {
    const handler = fn();
    const { unmount } = renderHook(() => useEventListener("ping", handler));
    unmount();
    ping();
    expect(handler).not.toHaveBeenCalled();
    const addedListener = added.find((entry) => entry.type === "ping").listener;
    expect(removed.some((entry) => entry.type === "ping" && entry.listener === addedListener)).toBe(true);
  });

  it("drops the old listener when the event type changes", () => {
    const handler = fn();
    const { rerender } = renderHook(({ type }) => useEventListener(type, handler), {
      initialProps: { type: "ping" },
    });
    rerender({ type: "pong" });
    ping(window, "ping");
    expect(handler).not.toHaveBeenCalled();
    ping(window, "pong");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("moves the listener when the target element changes", () => {
    const first = document.createElement("div");
    const second = document.createElement("div");
    const handler = fn();
    const { rerender } = renderHook(({ target }) => useEventListener("ping", handler, { target }), {
      initialProps: { target: first },
    });
    ping(first);
    expect(handler).toHaveBeenCalledTimes(1);

    rerender({ target: second });
    ping(first);
    expect(handler).toHaveBeenCalledTimes(1); // the old element no longer notifies us
    ping(second);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("does not listen while enabled is false and starts when it becomes true", () => {
    const handler = fn();
    const { rerender } = renderHook(({ enabled }) => useEventListener("ping", handler, { enabled }), {
      initialProps: { enabled: false },
    });
    ping();
    expect(handler).not.toHaveBeenCalled();
    expect(countOf(added, "ping")).toBe(0);

    rerender({ enabled: true });
    ping();
    expect(handler).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });
    ping();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("CartDrawer", () => {
  it("closes on Escape when it was opened after the first render", () => {
    const onClose = fn();
    const { rerender } = render(<CartDrawer isOpen={false} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled(); // closed drawers ignore Escape

    rerender(<CartDrawer isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a mousedown outside the panel but not inside it", () => {
    const onClose = fn();
    render(<CartDrawer isOpen={true} onClose={onClose} />);
    fireEvent.mouseDown(screen.getByText("Your cart is empty."));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves no window listeners behind after unmounting", () => {
    const { unmount } = render(<CartDrawer isOpen={true} onClose={() => {}} />);
    unmount();
    for (const type of ["keydown", "mousedown"]) {
      const addedFor = added.filter((entry) => entry.type === type).map((entry) => entry.listener);
      const removedFor = removed.filter((entry) => entry.type === type).map((entry) => entry.listener);
      expect(addedFor.every((listener) => removedFor.includes(listener))).toBe(true);
    }
  });
});
