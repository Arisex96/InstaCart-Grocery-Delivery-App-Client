// src/components/OrderStatusCard.jsx — the status card on the order tracking screen.
//
// States to cover (see the exercise text): first load, first load failed, order not found,
// success, background refresh, and a failed refresh with an order already on screen.
import useOrderStatus from "../hooks/useOrderStatus";

const PILL = {
  Placed: "bg-blue-100 text-blue-800",
  Packed: "bg-amber-100 text-amber-800",
  "Out for Delivery": "bg-orange-100 text-orange-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

const OrderStatusCard = ({ orderId, fetcher, intervalMs }) => {
  const { order, loading, error } = useOrderStatus(orderId, { fetcher, intervalMs });

  if (loading) {
    return (
      <div role="status" aria-label="Loading order" className="animate-pulse space-y-3 rounded-2xl border border-app-border bg-white p-5">
        <div className="h-5 w-1/3 rounded bg-zinc-200" />
        <div className="h-4 w-2/3 rounded bg-zinc-200" />
        <div className="h-4 w-1/2 rounded bg-zinc-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-app-error">
        Couldn't load your order
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg font-bold text-app-green">Order {order.id}</p>
        <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (PILL[order.status] || "bg-zinc-100")}>
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-app-text-light">{order.eta}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.name}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderStatusCard;
