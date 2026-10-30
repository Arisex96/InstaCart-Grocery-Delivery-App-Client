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
import { useCallback, useMemo, useState } from "react";

const round2 = (n) => Math.round(n * 100) / 100;

export function useWishlist(products) {
  // ROOT CAUSE 1: the Set was created once and mutated with add/delete, so `ids` never changed
  // identity and every memo/effect depending on it kept its first result.
  // FIX: ids is the single source of truth and is always REPLACED by a new Set.
  const [ids, setIds] = useState(() => new Set());

  const toggle = useCallback(
    (id) => {
      // FIX: ignore ids that are not in the catalogue (used to crash on `product.price`).
      if (!products.some((p) => p._id === id)) return;
      // ROOT CAUSE 2: `setCount(count + 1)` read `count` from the closure, so toggles in the same
      // event overwrote each other. FIX: functional update from the latest state.
      setIds((previous) => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [products],
  );

  const clear = useCallback(() => setIds(new Set()), []);

  // ROOT CAUSE 3: count and total lived in their own state and could drift from ids / prices.
  // FIX: derive everything from ids + products.
  const items = useMemo(() => products.filter((p) => ids.has(p._id)), [products, ids]);
  const count = items.length;
  const totalPrice = useMemo(() => round2(items.reduce((sum, p) => sum + p.price, 0)), [items]);

  const has = useCallback((id) => ids.has(id), [ids]);

  return { ids, items, count, totalPrice, has, toggle, clear };
}
