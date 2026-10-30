// src/lib/orderUtils.js — pure helpers for the "My orders" screen.
// The component files import these; the tests also call them directly.
//
// Order: { id, status, createdAt (ISO, UTC), total, items: [{ name, quantity, price }] }
// status: placed | packed | out_for_delivery | delivered | cancelled

export const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

// TODO: "Placed", "Packed", "Out for delivery", "Delivered", "Cancelled"
export const STATUS_LABELS = {};

export const statusLabel = (status) => STATUS_LABELS[status] ?? status;

/** "$12.34". Work in cents so 1.2 * 3 never prints $3.5999999. */
export const formatMoney = (amount) => String(amount); // TODO

/** "Today", "Yesterday", "Mar 5" or "Dec 30, 2025" — see the UI requirements (UTC calendar days). */
export const formatOrderDate = (iso, now = new Date()) => iso; // TODO

/** Total number of units in the order (sum of quantities). */
export const countItems = (order) => 0; // TODO

/** active = placed | packed | out_for_delivery. */
export const filterOrders = (orders, filterId) => orders; // TODO

/** { all, active, delivered, cancelled } counts. */
export const countByFilter = (orders) => ({ all: 0, active: 0, delivered: 0, cancelled: 0 }); // TODO

/**
 * The 4-step delivery timeline for a status:
 * [{ key, label, state: "completed" | "current" | "upcoming" }, ...]
 * Cancelled orders have no timeline (return []). Delivered: all completed, none current.
 */
export const stepStates = (status) => []; // TODO
