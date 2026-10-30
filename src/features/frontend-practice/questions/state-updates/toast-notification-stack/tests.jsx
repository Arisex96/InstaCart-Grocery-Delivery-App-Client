import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationProvider, useNotifications } from "./src/components/NotificationProvider";

// Tests check the contract in the UI requirements (roles, labels, text), not class names.
let api;
const Probe = () => {
  api = useNotifications();
  return null;
};
const setup = (props = {}) => render(<NotificationProvider {...props}><Probe /></NotificationProvider>);
const region = () => screen.getByRole("region", { name: "Notifications" });
const cards = () => [...region().querySelectorAll("[role=status],[role=alert]")];
const messages = () => cards().map((c) => c.textContent);
const notify = (options) => {
  let id;
  act(() => {
    id = api.notify(options);
  });
  return id;
};

/** Records timers with a marker delay that are created and neither fired nor cleared. */
function trackTimers(markerMs) {
  const originalSet = globalThis.setTimeout;
  const originalClear = globalThis.clearTimeout;
  const pending = new Set();
  globalThis.setTimeout = (callback, ms, ...rest) => {
    if (ms !== markerMs) return originalSet(callback, ms, ...rest);
    const id = originalSet((...args) => {
      pending.delete(id);
      callback(...args);
    }, ms, ...rest);
    pending.add(id);
    return id;
  };
  globalThis.clearTimeout = (id) => {
    pending.delete(id);
    return originalClear(id);
  };
  return {
    pending,
    restore: () => {
      globalThis.setTimeout = originalSet;
      globalThis.clearTimeout = originalClear;
    },
  };
}

describe("rendering", () => {
  it("renders its children and an empty Notifications region", () => {
    render(<NotificationProvider><p>app content</p></NotificationProvider>);
    expect(screen.getByText("app content")).toBeInTheDocument();
    expect(region()).toBeInTheDocument();
    expect(cards()).toHaveLength(0);
  });

  it("uses role=status for success and info and role=alert for errors", () => {
    setup({ defaultDuration: 0 });
    notify({ type: "success", message: "Saved" });
    notify({ message: "FYI" }); // type defaults to info
    notify({ type: "error", message: "Boom" });
    expect(within(region()).getAllByRole("status").map((c) => c.textContent)).toEqual(["Saved", "FYI"]);
    expect(within(region()).getByRole("alert")).toHaveTextContent("Boom");
  });
});

describe("dismissing", () => {
  it("removes only the clicked card with its Dismiss notification button", async () => {
    const user = userEvent.setup();
    setup({ defaultDuration: 0 });
    notify({ message: "first" });
    notify({ message: "second" });
    const second = cards().find((c) => c.textContent.includes("second"));
    await user.click(within(second).getByRole("button", { name: "Dismiss notification" }));
    expect(messages()).toEqual(["first"]);
  });

  it("gives every notification a unique id so dismiss(id) removes exactly one", () => {
    setup({ defaultDuration: 0 });
    const a = notify({ message: "a" });
    const b = notify({ message: "b" });
    const c = notify({ message: "c" });
    expect(new Set([a, b, c]).size).toBe(3);
    act(() => api.dismiss(b));
    expect(messages()).toEqual(["a", "c"]);
    act(() => api.dismiss(b)); // already gone: no crash, no change
    expect(messages()).toEqual(["a", "c"]);
  });
});

describe("auto-dismiss", () => {
  it("auto-dismisses after its own duration and not before", async () => {
    setup();
    notify({ message: "short lived", duration: 60 });
    expect(messages()).toEqual(["short lived"]);
    await waitFor(() => expect(messages()).toEqual([]));
  });

  it("falls back to defaultDuration and treats duration 0 as sticky", async () => {
    setup({ defaultDuration: 40 });
    notify({ message: "default" });
    notify({ message: "sticky", duration: 0 });
    await waitFor(() => expect(messages()).toEqual(["sticky"]));
    await sleep(150);
    expect(messages()).toEqual(["sticky"]);
  });
});

describe("limits and cleanup", () => {
  it("shows at most three notifications and drops the oldest, even when fired in one batch", () => {
    setup({ defaultDuration: 0 });
    act(() => {
      for (let i = 1; i <= 5; i++) api.notify({ message: `n${i}` });
    });
    expect(messages()).toEqual(["n3", "n4", "n5"]);
  });

  it("respects a custom maxVisible", () => {
    setup({ defaultDuration: 0, maxVisible: 1 });
    notify({ message: "one" });
    notify({ message: "two" });
    expect(messages()).toEqual(["two"]);
  });

  it("leaves no timers running after dismissal, overflow or unmount", () => {
    const timers = trackTimers(7777);
    try {
      const { unmount } = setup({ maxVisible: 2 });
      const first = notify({ message: "one", duration: 7777 });
      expect(messages()).toEqual(["one"]); // it rendered, so a timer is expected
      notify({ message: "two", duration: 7777 });
      notify({ message: "three", duration: 7777 }); // drops "one" by overflow
      expect(messages()).toEqual(["two", "three"]);
      expect(timers.pending.size).toBe(2);
      act(() => api.dismiss(first)); // already dropped: nothing changes
      const second = cards()[0];
      act(() => within(second).getByRole("button", { name: "Dismiss notification" }).click());
      expect(timers.pending.size).toBe(1);
      unmount();
      expect(timers.pending.size).toBe(0);
    } finally {
      timers.restore();
    }
  });
});

describe("hook contract", () => {
  it("throws an error mentioning NotificationProvider when used outside the provider", () => {
    const Orphan = () => {
      useNotifications();
      return null;
    };
    expect(() => render(<Orphan />)).toThrow(/NotificationProvider/);
  });
});
