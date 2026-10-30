// src/components/NotificationProvider.jsx — a tiny notification system for the admin area.
// (The storefront uses react-hot-toast, e.g. in src/store/useCartStore.ts; this one has no dependencies.)
//
//   <NotificationProvider defaultDuration={4000} maxVisible={3}>   wraps the app
//   const { notify, dismiss } = useNotifications();                 used anywhere below it
//   const id = notify({ type: "success" | "error" | "info", message: "Saved", duration: 3000 });
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";

const NotificationContext = createContext(null);

const STYLE = {
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: <Check className="size-4 text-app-success" /> },
  error: { box: "border-red-200 bg-red-50 text-red-900", icon: <AlertCircle className="size-4 text-app-error" /> },
  info: { box: "border-app-border bg-white text-app-text", icon: <span className="size-2 rounded-full bg-app-orange" /> },
};

export function NotificationProvider({ children, defaultDuration = 4000, maxVisible = 3 }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1); // unique ids, never reused
  const timers = useRef(new Map()); // notification id -> timeout id

  // APPROACH: notify/dismiss only change the list. Functional updates make several notify() calls in
  // one event safe, and slice(-maxVisible) drops the oldest ones.
  const notify = useCallback(
    ({ type = "info", message, duration } = {}) => {
      const id = nextId.current++;
      const item = { id, type, message, duration: duration ?? defaultDuration };
      setItems((current) => [...current, item].slice(-maxVisible));
      return id;
    },
    [defaultDuration, maxVisible],
  );

  const dismiss = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  // APPROACH: timers are derived from the list. Schedule a timeout for items that have none, and
  // clear the timeout of anything that left the list (dismissed or dropped by the overflow rule).
  useEffect(() => {
    const live = new Set(items.map((item) => item.id));
    for (const [id, timer] of timers.current) {
      if (!live.has(id)) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }
    for (const item of items) {
      if (item.duration > 0 && !timers.current.has(item.id)) {
        const timer = setTimeout(() => {
          timers.current.delete(item.id);
          dismiss(item.id);
        }, item.duration);
        timers.current.set(item.id, timer);
      }
    }
  }, [items, dismiss]);

  // Unmount: nothing may fire after the provider is gone.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const api = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2"
      >
        {items.map((item) => {
          const style = STYLE[item.type] ?? STYLE.info;
          return (
            <div
              key={item.id}
              role={item.type === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border p-3 text-sm shadow-lg ${style.box}`}
            >
              <span className="mt-1 shrink-0">{style.icon}</span>
              <span className="min-w-0 flex-1">{item.message}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-full p-0.5 hover:bg-black/10"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const api = useContext(NotificationContext);
  if (!api) throw new Error("useNotifications must be used within a NotificationProvider");
  return api;
}
