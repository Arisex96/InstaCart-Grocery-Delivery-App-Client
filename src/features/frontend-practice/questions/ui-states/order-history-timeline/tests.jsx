import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderHistory from "./src/components/OrderHistory";
import { NOW, orders } from "./src/data/orders";
import { countByFilter, countItems, filterOrders, formatMoney, formatOrderDate, stepStates } from "./src/lib/orderUtils";

// The tests check the contract from the UI requirements (roles, labels, text, aria), not class names.
const show = (data = orders) => render(<OrderHistory orders={data} now={NOW} />);
const rowButtons = () => screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
const rowFor = (id) => rowButtons().find((b) => b.textContent.includes(id));
const tab = (name) => screen.getByRole("tab", { name });
const order = (id, status, createdAt, items = [{ name: "Thing", quantity: 1, price: 1 }]) => ({
  id,
  status,
  createdAt,
  items,
  total: 1,
});

describe("order utils", () => {
  it("formats the relative date label from UTC calendar days", () => {
    expect(formatOrderDate("2026-03-10T00:30:00Z", NOW)).toBe("Today");
    expect(formatOrderDate("2026-03-10T11:59:00Z", NOW)).toBe("Today");
    expect(formatOrderDate("2026-03-09T23:59:00Z", NOW)).toBe("Yesterday");
    expect(formatOrderDate("2026-03-05T10:00:00Z", NOW)).toBe("Mar 5");
    expect(formatOrderDate("2026-02-20T15:00:00Z", NOW)).toBe("Feb 20");
    expect(formatOrderDate("2025-12-30T10:00:00Z", NOW)).toBe("Dec 30, 2025");
  });

  it("uses calendar days, not 24 hour windows, for Today/Yesterday", () => {
    const justAfterMidnight = new Date("2026-03-10T00:10:00Z");
    expect(formatOrderDate("2026-03-09T22:00:00Z", justAfterMidnight)).toBe("Yesterday"); // 2h earlier
    expect(formatOrderDate("2026-03-08T23:59:00Z", justAfterMidnight)).toBe("Mar 8");
  });

  it("counts items as the sum of quantities and formats money in whole cents", () => {
    expect(countItems(orders[0])).toBe(7);
    expect(countItems(orders[3])).toBe(1);
    expect(formatMoney(1.2 * 3)).toBe("$3.60");
    expect(formatMoney(25.18)).toBe("$25.18");
    expect(formatMoney(5)).toBe("$5.00");
  });

  it("filters and counts orders by group (active = placed, packed, out for delivery)", () => {
    expect(countByFilter(orders)).toEqual({ all: 5, active: 2, delivered: 2, cancelled: 1 });
    expect(filterOrders(orders, "active").map((o) => o.id)).toEqual(["IC-1005", "IC-1004"]);
    expect(filterOrders(orders, "delivered").map((o) => o.id)).toEqual(["IC-1003", "IC-1001"]);
    expect(filterOrders(orders, "cancelled").map((o) => o.id)).toEqual(["IC-1002"]);
    expect(filterOrders(orders, "all")).toHaveLength(5);
  });

  it("derives timeline step states for every status", () => {
    const states = (s) => stepStates(s).map((step) => `${step.label}:${step.state}`);
    expect(states("placed")).toEqual(["Placed:current", "Packed:upcoming", "Out for delivery:upcoming", "Delivered:upcoming"]);
    expect(states("out_for_delivery")).toEqual([
      "Placed:completed",
      "Packed:completed",
      "Out for delivery:current",
      "Delivered:upcoming",
    ]);
    expect(stepStates("delivered").every((s) => s.state === "completed")).toBe(true);
    expect(stepStates("cancelled")).toEqual([]);
  });
});

describe("filter tabs", () => {
  it("renders a heading and filter tabs with counts, All selected first", () => {
    show();
    expect(screen.getByRole("heading", { name: "My orders", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Filter orders" })).toBeInTheDocument();
    expect(tab("All (5)")).toHaveAttribute("aria-selected", "true");
    expect(tab("Active (2)")).toHaveAttribute("aria-selected", "false");
    expect(tab("Delivered (2)")).toBeInTheDocument();
    expect(tab("Cancelled (1)")).toBeInTheDocument();
  });

  it("switches the filter tabs and the visible rows", async () => {
    const user = userEvent.setup();
    show();
    await user.click(tab("Active (2)"));
    expect(tab("Active (2)")).toHaveAttribute("aria-selected", "true");
    expect(tab("All (5)")).toHaveAttribute("aria-selected", "false");
    expect(rowButtons().map((b) => b.textContent.match(/IC-\d+/)[0])).toEqual(["IC-1005", "IC-1004"]);
    await user.click(tab("Cancelled (1)"));
    expect(rowButtons()).toHaveLength(1);
    expect(rowFor("IC-1002")).toBeInTheDocument();
  });

  it("shows an empty state per filter and for no orders at all, keeping the tabs", async () => {
    const user = userEvent.setup();
    const onlyDelivered = orders.filter((o) => o.status === "delivered");
    const { unmount } = show(onlyDelivered);
    await user.click(tab("Active (0)"));
    expect(screen.getByText("No active orders")).toBeInTheDocument();
    await user.click(tab("Cancelled (0)"));
    expect(screen.getByText("No cancelled orders")).toBeInTheDocument();
    unmount();

    show([]);
    expect(screen.getByText("You have no orders yet")).toBeInTheDocument();
    expect(tab("All (0)")).toBeInTheDocument();
    await user.click(tab("Delivered (0)"));
    expect(screen.getByText("No delivered orders")).toBeInTheDocument();
  });
});

describe("order rows", () => {
  it("shows id, relative date, status, item count and total on every row, in data order", () => {
    show();
    const buttons = rowButtons();
    expect(buttons).toHaveLength(5);
    expect(buttons.map((b) => b.textContent.match(/IC-\d+/)[0])).toEqual(["IC-1005", "IC-1004", "IC-1003", "IC-1002", "IC-1001"]);
    expect(rowFor("IC-1005")).toHaveTextContent("Today");
    expect(rowFor("IC-1005")).toHaveTextContent("Placed");
    expect(rowFor("IC-1005")).toHaveTextContent("7 items");
    expect(rowFor("IC-1005")).toHaveTextContent("$25.18");
    expect(rowFor("IC-1004")).toHaveTextContent("Yesterday");
    expect(rowFor("IC-1004")).toHaveTextContent("Out for delivery");
    expect(rowFor("IC-1003")).toHaveTextContent("Mar 5");
    expect(rowFor("IC-1002")).toHaveTextContent("1 item");
    expect(rowFor("IC-1002")).not.toHaveTextContent("1 items");
    expect(rowFor("IC-1001")).toHaveTextContent("Feb 20");
  });

  it("starts collapsed and expands a row into a labelled region with items and line totals", async () => {
    const user = userEvent.setup();
    show();
    expect(rowFor("IC-1005")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    await user.click(rowFor("IC-1005"));
    expect(rowFor("IC-1005")).toHaveAttribute("aria-expanded", "true");
    const region = screen.getByRole("region", { name: "Order IC-1005 details" });
    const items = within(within(region).getByRole("list", { name: "Items" })).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Organic Bananas × 3");
    expect(items[0]).toHaveTextContent("$3.60");
    expect(items[2]).toHaveTextContent("Sourdough Loaf × 2");
    expect(items[2]).toHaveTextContent("$11.98");
  });

  it("is an accordion: opening another row closes the previous one, clicking again closes it", async () => {
    const user = userEvent.setup();
    show();
    await user.click(rowFor("IC-1005"));
    await user.click(rowFor("IC-1003"));
    expect(rowFor("IC-1005")).toHaveAttribute("aria-expanded", "false");
    expect(rowFor("IC-1003")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("region")).toHaveLength(1);
    expect(screen.getByRole("region", { name: "Order IC-1003 details" })).toBeInTheDocument();

    await user.click(rowFor("IC-1003"));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

describe("delivery timeline", () => {
  // What assistive tech reads: text without aria-hidden decoration (step numbers, icons).
  const readable = (li) => {
    const copy = li.cloneNode(true);
    copy.querySelectorAll("[aria-hidden=true]").forEach((n) => n.remove());
    return copy.textContent.replace(/s+/g, " ").trim();
  };
  const steps = () => within(screen.getByRole("list", { name: "Order progress" })).getAllByRole("listitem");

  it("marks the current step with aria-current and states completed/current/upcoming in text", async () => {
    const user = userEvent.setup();
    show();
    await user.click(rowFor("IC-1004")); // out for delivery
    const list = steps();
    expect(list.map(readable)).toEqual([
      "Placed completed",
      "Packed completed",
      "Out for delivery current",
      "Delivered upcoming",
    ]);
    expect(list[2]).toHaveAttribute("aria-current", "step");
    expect(list.filter((li) => li.hasAttribute("aria-current"))).toHaveLength(1);
  });

  it("shows a placed order at its first step", async () => {
    const user = userEvent.setup();
    show();
    await user.click(rowFor("IC-1005"));
    expect(steps()[0]).toHaveAttribute("aria-current", "step");
    expect(steps()[3]).toHaveTextContent("upcoming");
  });

  it("shows a delivered order as fully completed with no current step", async () => {
    const user = userEvent.setup();
    show();
    await user.click(rowFor("IC-1003"));
    expect(steps().every((li) => readable(li).includes("completed"))).toBe(true);
    expect(steps().some((li) => li.hasAttribute("aria-current"))).toBe(false);
  });

  it("shows Order cancelled instead of a timeline for a cancelled order", async () => {
    const user = userEvent.setup();
    show();
    await user.click(rowFor("IC-1002"));
    const region = screen.getByRole("region", { name: "Order IC-1002 details" });
    expect(within(region).getByText("Order cancelled")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Order progress" })).not.toBeInTheDocument();
  });
});

describe("derived data", () => {
  it("updates counts, rows and dates when the props change (no copied state)", () => {
    const { rerender } = show();
    expect(tab("Active (2)")).toBeInTheDocument();
    const more = [...orders, order("IC-2000", "packed", "2026-03-10T10:00:00Z")];
    rerender(<OrderHistory orders={more} now={NOW} />);
    expect(tab("All (6)")).toBeInTheDocument();
    expect(tab("Active (3)")).toBeInTheDocument();
    expect(rowFor("IC-2000")).toHaveTextContent("Today");

    rerender(<OrderHistory orders={more} now={new Date("2026-03-12T12:00:00Z")} />);
    expect(rowFor("IC-2000")).toHaveTextContent("Mar 10");
    expect(rowFor("IC-1005")).toHaveTextContent("Mar 10");
  });
});
