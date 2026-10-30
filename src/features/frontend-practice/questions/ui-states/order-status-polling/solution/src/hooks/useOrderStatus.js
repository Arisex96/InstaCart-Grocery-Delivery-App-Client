// src/hooks/useOrderStatus.js — polls an order's status (the idea behind OrderTracking.tsx).
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchOrder } from "../api/orders";

const TERMINAL = ["Delivered", "Cancelled"];

export default function useOrderStatus(orderId, { fetcher = fetchOrder, intervalMs = 5000 } = {}) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0); // bumping it restarts the polling loop (Retry)
  const hasData = useRef(false);

  useEffect(() => {
    // FIX (no cleanup / never stops): the original called setInterval and never cleared it, so
    // polling survived unmounts and terminal statuses. The loop below is owned by this effect run:
    // `cancelled` is flipped by the cleanup, and the loop simply does not schedule itself again
    // when the order is final, missing, or failed before anything was shown.
    let cancelled = false;
    let timer;

    const poll = async () => {
      // FIX (skeleton flicker): `loading` is only for the FIRST response. Later polls are
      // background refreshes and must not replace the data with a skeleton.
      if (hasData.current) setRefreshing(true);
      else setLoading(true);

      let keepPolling = true;
      try {
        const data = await fetcher(orderId);
        if (cancelled) return;
        hasData.current = Boolean(data);
        setOrder(data);
        setError(null);
        keepPolling = Boolean(data) && !TERMINAL.includes(data.status);
      } catch (err) {
        if (cancelled) return;
        // FIX (order vanishes on error): keep the last known order, only record the error. If
        // nothing was ever shown there is nothing to refresh: wait for the shopper to press Retry.
        setError(err);
        keepPolling = hasData.current;
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
      // Schedule the next poll only after this one finished: requests never overlap.
      if (!cancelled && keepPolling) timer = setTimeout(poll, intervalMs);
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, fetcher, intervalMs, attempt]);

  // FIX (nothing to tap): Retry restarts the loop right away.
  const retry = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { order, loading, refreshing, error, retry };
}
