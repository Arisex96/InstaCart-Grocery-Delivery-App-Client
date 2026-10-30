// src/components/OrderHistory.jsx — the "My orders" screen
// (client/src/pages/MyOrders.tsx is the real page; this version takes its data as props).
//
// Props
//   orders  see src/data/orders.js
//   now     Date used for "Today"/"Yesterday" (defaults to the current time)
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) renders it with a
// few data scenarios and the "Target UI" output tab shows the finished screen.
import { useState } from "react";
import OrderTimeline from "./OrderTimeline";
import { FILTERS, countByFilter, filterOrders } from "../lib/orderUtils";

const OrderHistory = ({ orders, now = new Date() }) => {
  // TODO: which filter tab is selected? which single order (if any) is expanded?
  const [filter] = useState("all");
  const counts = countByFilter(orders);
  const visible = filterOrders(orders, filter);

  // TODO: filter tabs with counts, one expandable row per order, empty state per filter.
  // Keep the helpers in src/lib/orderUtils.js and the stepper in OrderTimeline.jsx.
  void now;
  void OrderTimeline;
  void FILTERS;

  return (
    <section className="rounded-2xl border border-app-border bg-white p-5">
      <h2 className="font-serif text-2xl text-app-green">My orders</h2>
      <p className="mt-3 text-sm text-app-text-light">
        Not built yet: {visible.length} orders to show, {counts.all} in total.
      </p>
    </section>
  );
};

export default OrderHistory;
