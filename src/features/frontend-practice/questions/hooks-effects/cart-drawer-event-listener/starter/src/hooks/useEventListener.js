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
import { useEffect } from "react";

const useEventListener = (type, handler, { target = window } = {}) => {
  useEffect(() => {
    target.addEventListener(type, (event) => handler(event));

    return () => {
      target.removeEventListener(type, (event) => handler(event));
    };
  }, [type]);
};

export default useEventListener;
