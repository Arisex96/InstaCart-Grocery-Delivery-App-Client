// src/components/OrderStatusCard.jsx — the status card on the order tracking screen.
import useOrderStatus from "../hooks/useOrderStatus";

const PILL = {
  Placed: "bg-blue-100 text-blue-800",
  Packed: "bg-amber-100 text-amber-800",
  "Out for Delivery": "bg-orange-100 text-orange-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

const OrderStatusCard = ({ orderId, fetcher, intervalMs }) => {
  const { order, loading, refreshing, error, retry } = useOrderStatus(orderId, { fetcher, intervalMs });

  // 1. First load: skeleton.
  if (loading && !order) {
    return (
      <div role="status" aria-label="Loading order" className="animate-pulse space-y-3 rounded-2xl border border-app-border bg-white p-5">
        <div className="h-5 w-1/3 rounded bg-zinc-200" />
        <div className="h-4 w-2/3 rounded bg-zinc-200" />
        <div className="h-4 w-1/2 rounded bg-zinc-200" />
      </div>
    );
  }

  // 2. First load failed (nothing to show): full error with a way out.
  if (error && !order) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-app-error">
        <p>Couldn't load your order</p>
        <button onClick={retry} className="mt-3 rounded-full bg-app-green px-4 py-1.5 text-xs font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  // 3. Loaded, but the order does not exist: explicit empty state (the original rendered nothing).
  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-app-border bg-white p-5 text-sm text-app-text-light">
        We couldn't find this order
      </div>
    );
  }

  // 4. Success, optionally refreshing in the background, optionally with a failed refresh.
  return (
    <div className="rounded-2xl border border-app-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg font-bold text-app-green">Order {order.id}</p>
        <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (PILL[order.status] || "bg-zinc-100")}>
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-app-text-light">
        {order.eta} {refreshing && <span className="text-xs">Updating…</span>}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <li key={item.name}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      {error && (
        <div role="alert" className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
          <span>Couldn't refresh the status — showing the last update.</span>
          <button onClick={retry} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderStatusCard;
