// src/lib/orderUtils.js — pure helpers for the "My orders" screen.
// The component files import these; the tests also call them directly.
//
// APPROACH: keep every rule that is not about markup in small pure functions. They are easy to
// test, and the components stay declarative (derive everything from props during render).

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export const STATUS_LABELS = {
  placed: "Placed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const statusLabel = (status) => STATUS_LABELS[status] ?? status;

// Money in integer cents: 1.2 * 3 is 3.5999999999999996 as a float, but exactly 360 cents.
export const formatMoney = (amount) => "$" + (Math.round(amount * 100) / 100).toFixed(2);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 24 * 60 * 60 * 1000;
const utcDay = (date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

// TRAP: comparing timestamps (now - created < 24h) gives "Yesterday" for something 3 hours old
// just after midnight. Compare calendar days instead — in UTC, so the result does not depend on
// the viewer's time zone.
export function formatOrderDate(iso, now = new Date()) {
  const created = new Date(iso);
  const diffDays = Math.round((utcDay(now) - utcDay(created)) / DAY_MS);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  const label = `${MONTHS[created.getUTCMonth()]} ${created.getUTCDate()}`;
  return created.getUTCFullYear() === now.getUTCFullYear() ? label : `${label}, ${created.getUTCFullYear()}`;
}

export const countItems = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

const ACTIVE = ["placed", "packed", "out_for_delivery"];
const matches = (order, filterId) =>
  filterId === "all" ? true : filterId === "active" ? ACTIVE.includes(order.status) : order.status === filterId;

export const filterOrders = (orders, filterId) => orders.filter((order) => matches(order, filterId));

export const countByFilter = (orders) =>
  Object.fromEntries(FILTERS.map(({ id }) => [id, filterOrders(orders, id).length]));

const STEPS = [
  { key: "placed", label: "Placed" },
  { key: "packed", label: "Packed" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export function stepStates(status) {
  if (status === "cancelled") return [];
  const index = STEPS.findIndex((step) => step.key === status);
  return STEPS.map((step, i) => ({
    ...step,
    // A delivered order is finished: every step is completed and none is "current".
    state: status === "delivered" || i < index ? "completed" : i === index ? "current" : "upcoming",
  }));
}
