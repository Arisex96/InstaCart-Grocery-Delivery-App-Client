// src/hooks/useEventListener.js — shared hook behind "close on Escape" / "close on outside click"
// in the cart drawer (client/src/components/CartSideBar.tsx) and the navbar menus.
//
//   useEventListener(type, handler, { target = window, enabled = true })
//
//   type     DOM event name, e.g. "keydown"
//   handler  called with the event; callers pass inline functions that read their latest props/state
//   target   window (default) or any element
//   enabled  when false the hook must not listen at all
//
// Reported: "Escape sometimes does nothing" and "listener count grows after remounts".
import { useEffect, useRef } from "react";

const useEventListener = (type, handler, { target = window, enabled = true } = {}) => {
  // FIX (stale handler): remember the newest handler in a ref that is refreshed after every
  // render. The long-lived listener below reads it at event time, so it never goes stale and
  // we do not have to re-subscribe when the caller passes a new inline function.
  const latestHandler = useRef(handler);
  useEffect(() => {
    latestHandler.current = handler;
  });

  useEffect(() => {
    // FIX (enabled/target): honour the options.
    if (!enabled || !target) return;

    // ROOT CAUSE 1 (stale closure): the old effect wrapped the handler from the first render
    // because it only re-ran when `type` changed.
    // ROOT CAUSE 2 (leak): the cleanup removed a NEW arrow function, which is never the same
    // object that was added, so nothing was ever removed.
    // FIX: create one named listener, add it, and remove that exact reference.
    const listener = (event) => latestHandler.current(event);
    target.addEventListener(type, listener);
    return () => {
      target.removeEventListener(type, listener);
    };
  }, [type, target, enabled]);
};

export default useEventListener;
