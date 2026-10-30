// src/hooks/useWishlist.js — backs the heart buttons on ProductCard and the "Saved items" panel.
//
// useWishlist(products) -> { ids, items, count, totalPrice, has(id), toggle(id), clear() }
//   ids     Set of product _ids the shopper saved
//   items   the saved products (taken from `products`)
//   count   how many are saved
//   totalPrice  sum of their current prices
//
// Beta feedback: the saved list under the hearts stays empty, "Save all" miscounts, the total ignores
// price changes, and hearts on removed products crash.
import { useMemo, useState } from "react";

export function useWishlist(products) {
  const [ids] = useState(() => new Set());
  const [count, setCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Saved products for the "Saved items" panel.
  const items = useMemo(() => products.filter((p) => ids.has(p._id)), [products, ids]);

  const toggle = (id) => {
    const product = products.find((p) => p._id === id);
    if (ids.has(id)) {
      ids.delete(id);
      setCount(count - 1);
      setTotalPrice(totalPrice - product.price);
    } else {
      ids.add(id);
      setCount(count + 1);
      setTotalPrice(totalPrice + product.price);
    }
  };

  const clear = () => {
    ids.clear();
    setCount(0);
    setTotalPrice(0);
  };

  const has = (id) => ids.has(id);

  return { ids, items, count, totalPrice, has, toggle, clear };
}
