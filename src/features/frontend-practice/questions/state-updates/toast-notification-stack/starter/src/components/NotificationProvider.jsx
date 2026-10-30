// src/components/NotificationProvider.jsx — a tiny notification system for the admin area.
// (The storefront uses react-hot-toast, e.g. in src/store/useCartStore.ts; this one has no dependencies.)
//
//   <NotificationProvider defaultDuration={4000} maxVisible={3}>   wraps the app
//   const { notify, dismiss } = useNotifications();                 used anywhere below it
//   const id = notify({ type: "success" | "error" | "info", message: "Saved", duration: 3000 });
//
// Build it from the UI requirements in the Problem tab. The Demo (src/Demo.jsx) has buttons that
// call notify(), and the "Target UI" output tab shows the finished design.
import { createContext } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children, defaultDuration = 4000, maxVisible = 3 }) {
  // TODO: keep the visible notifications in state: [{ id, type, message, duration }].
  // TODO: unique ids (a ref counter), and keep only the newest `maxVisible`.
  // TODO: an auto-dismiss timer per notification (duration 0 = sticky). Clear it on dismiss/overflow/unmount.
  // TODO: render the stack: <div role="region" aria-label="Notifications"> with one card per notification.
  const api = { notify: () => 0, dismiss: () => undefined, defaultDuration, maxVisible };

  return <NotificationContext.Provider value={api}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  // TODO: throw an Error mentioning NotificationProvider when used outside the provider.
  return { notify: () => 0, dismiss: () => undefined, context: NotificationContext };
}
