// src/context/CartContext.jsx — an in-memory cart provider (an alternative to the zustand store in
// client/src/store/useCartStore.ts that the team is trying out).
//
// Consumers (read-only, already wrapped in React.memo):
//   CartBadge   -> useCartState()    reads { items, total, count }
//   ProductRow  -> useCartActions()  reads { add, remove }
//
// Profiling reported: "every keystroke in the search box re-renders the badge and all rows".
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = (product) => {
    const found = items.find((line) => line.product._id === product._id);
    if (found) {
      setItems(items.map((line) => (line === found ? { ...line, quantity: line.quantity + 1 } : line)));
    } else {
      setItems([...items, { product, quantity: 1 }]);
    }
  };

  const remove = (productId) => {
    setItems(items.filter((line) => line.product._id !== productId));
  };

  const total = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const count = items.reduce((sum, line) => sum + line.quantity, 0);

  const value = { items, total, count, add, remove };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartState() {
  return useContext(CartContext);
}

export function useCartActions() {
  return useContext(CartContext);
}
