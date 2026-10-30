// src/hooks/useOrderStatus.js — polls an order's status (the idea behind OrderTracking.tsx).
//
//   const { order, loading, refreshing, error, retry } = useOrderStatus(orderId, { fetcher, intervalMs });
//
//   order       latest order object ({ id, status, ... }) or null
//   loading     true only until the FIRST response arrives
//   refreshing  true while a later (background) poll is in flight
//   error       the last error, or null
//   retry()     tries again right away
//
// `fetcher(orderId)` resolves to an order, or to null when the order does not exist.
// Statuses "Delivered" and "Cancelled" are final: nothing changes after them.
//
// Support reports: skeleton flicker, requests that never stop, orders vanishing on errors.
import { useEffect, useState } from "react";
import { fetchOrder } from "../api/orders";

export default function useOrderStatus(orderId, { fetcher = fetchOrder, intervalMs = 5000 } = {}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetcher(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError(err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    setInterval(load, intervalMs);
  }, [orderId, fetcher, intervalMs]);

  return { order, loading, refreshing: false, error, retry: () => {} };
}
