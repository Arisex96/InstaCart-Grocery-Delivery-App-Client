// src/context/CartContext.jsx — an in-memory cart provider (an alternative to the zustand store in
// client/src/store/useCartStore.ts that the team is trying out).
//
// Consumers (read-only, already wrapped in React.memo):
//   CartBadge   -> useCartState()    reads { items, total, count }
//   ProductRow  -> useCartActions()  reads { add, remove }
//
// Profiling reported: "every keystroke in the search box re-renders the badge and all rows".
import { createContext, useCallback, useContext, useMemo, useState } from "react";

// ROOT CAUSE: a single context whose `value` was a brand-new object (with new add/remove closures)
// on EVERY provider render. Context consumers re-render whenever the value identity changes, so
// memo() on the consumers could not help, and rows (which only need `add`) re-rendered on every
// cart change too.
// FIX: split state from actions, and keep each value referentially stable.
const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Functional updates: the callbacks do not close over `items`, so they can be created once.
  const add = useCallback((product) => {
    setItems((prev) => {
      const found = prev.find((line) => line.product._id === product._id);
      if (found) return prev.map((line) => (line === found ? { ...line, quantity: line.quantity + 1 } : line));
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((productId) => {
    setItems((prev) => prev.filter((line) => line.product._id !== productId));
  }, []);

  const actions = useMemo(() => ({ add, remove }), [add, remove]);

  // Only changes when the cart contents change, not when the provider's parent re-renders.
  const state = useMemo(
    () => ({
      items,
      total: items.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
      count: items.reduce((sum, line) => sum + line.quantity, 0),
    }),
    [items],
  );

  return (
    <CartActionsContext.Provider value={actions}>
      <CartStateContext.Provider value={state}>{children}</CartStateContext.Provider>
    </CartActionsContext.Provider>
  );
}

export function useCartState() {
  const value = useContext(CartStateContext);
  if (!value) throw new Error("useCartState must be used inside <CartProvider>");
  return value;
}

export function useCartActions() {
  const value = useContext(CartActionsContext);
  if (!value) throw new Error("useCartActions must be used inside <CartProvider>");
  return value;
}
