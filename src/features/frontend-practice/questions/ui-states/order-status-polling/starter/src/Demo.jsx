// src/Demo.jsx — read-only. The live preview renders this file's default export.
//
// The card polls every 3 seconds. The fake service moves the order Placed -> Packed ->
// Out for Delivery -> Delivered, one step per successful request. Watch the request counter.
import { useEffect, useState } from "react";
import OrderStatusCard from "./components/OrderStatusCard";
import { ordersApi } from "./api/orders";

export default function Demo() {
  const [orderId, setOrderId] = useState("o-1042");
  const [requests, setRequests] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    ordersApi.reset();
    const timer = setInterval(() => setRequests(ordersApi.requestCount()), 300);
    return () => clearInterval(timer);
  }, []);

  const button = "rounded-full border border-app-border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-app-cream";

  return (
    <div className="max-w-md space-y-3">
      {shown && <OrderStatusCard key={orderId} orderId={orderId} intervalMs={3000} />}
      <p className="text-xs text-app-text-light">
        API requests so far: <b className="text-app-green">{requests}</b>
      </p>
      <div className="flex flex-wrap gap-2">
        <button className={button} onClick={() => ordersApi.failNext(1)}>
          Fail next refresh
        </button>
        <button className={button} onClick={() => setOrderId("missing")}>
          Look up a missing order
        </button>
        <button className={button} onClick={() => setShown(false)}>
          Leave the page (unmount)
        </button>
      </div>
    </div>
  );
}
