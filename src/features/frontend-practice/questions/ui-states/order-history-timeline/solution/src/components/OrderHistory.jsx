// src/components/OrderHistory.jsx — the "My orders" screen
// (client/src/pages/MyOrders.tsx is the real page; this version takes its data as props).
//
// Props
//   orders  see src/data/orders.js
//   now     Date used for "Today"/"Yesterday" (defaults to the current time)
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import OrderTimeline from "./OrderTimeline";
import {
  FILTERS,
  countByFilter,
  countItems,
  filterOrders,
  formatMoney,
  formatOrderDate,
  statusLabel,
} from "../lib/orderUtils";

const BADGE = {
  placed: "bg-sky-100 text-sky-800",
  packed: "bg-amber-100 text-amber-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

const EMPTY_MESSAGE = {
  all: "You have no orders yet",
  active: "No active orders",
  delivered: "No delivered orders",
  cancelled: "No cancelled orders",
};

const OrderHistory = ({ orders, now = new Date() }) => {
  // APPROACH: the only state is UI state (which tab, which row). The visible list, the counts, the
  // dates and the timeline are all derived from `orders` on every render, so they can never go
  // stale when the parent passes new data. Storing the expanded *id* (not an index) keeps the
  // right row open when the filter or the data changes.
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null); // accordion: at most one row open
  const counts = countByFilter(orders);
  const visible = filterOrders(orders, filter);

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <h2 className="font-serif text-2xl text-app-green">My orders</h2>

      <div role="tablist" aria-label="Filter orders" className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              filter === id
                ? "border-app-green bg-app-green text-white"
                : "border-app-border bg-white text-app-text hover:bg-app-cream"
            }`}
          >
            {label} ({counts[id]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 rounded-xl bg-app-cream p-6 text-center text-sm text-app-text-light">{EMPTY_MESSAGE[filter]}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((order) => {
            const open = openId === order.id;
            const itemCount = countItems(order);
            return (
              <li key={order.id} className="rounded-xl border border-app-border">
                <button
                  aria-expanded={open}
                  aria-controls={`order-${order.id}`}
                  onClick={() => setOpenId(open ? null : order.id)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-app-cream/60"
                >
                  <ChevronRight aria-hidden="true" className={`size-4 shrink-0 text-app-text-light transition-transform ${open ? "rotate-90" : ""}`} />
                  <span className="font-bold text-app-green">{order.id}</span>
                  <span className="text-sm text-app-text-light">{formatOrderDate(order.createdAt, now)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${BADGE[order.status]}`}>
                    {statusLabel(order.status)}
                  </span>
                  <span className="ml-auto text-sm text-app-text-light">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-bold text-app-text">{formatMoney(order.total)}</span>
                </button>

                {open && (
                  <div
                    id={`order-${order.id}`}
                    role="region"
                    aria-label={`Order ${order.id} details`}
                    className="flex flex-col gap-4 border-t border-app-border bg-app-cream/40 px-4 py-4"
                  >
                    <ul aria-label="Items" className="divide-y divide-app-border">
                      {order.items.map((item) => (
                        <li key={item.name} className="flex items-center justify-between py-1.5 text-sm">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-semibold">{formatMoney(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <OrderTimeline status={order.status} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default OrderHistory;
