// src/hooks/useWishlist.js — reviewed and fixed version of the AI-generated hook.
import { useCallback, useRef, useState } from "react";
import api from "../api/axios";
import { products } from "../data/products";

export default function useWishlist() {
  const [ids, setIdsState] = useState([]);
  const [error, setError] = useState(null);

  // FIX 1 (stale closure): the original memoised `toggle` with [] but read `ids` inside it, so it
  // always saw the first render's empty list (second tap dropped the first item, un-wishing never
  // worked). A ref always holds the latest list, so `toggle` can stay stable AND correct.
  const idsRef = useRef([]);
  const setIds = (next) => {
    idsRef.current = next;
    setIdsState(next);
  };

  const apply = (productId, wished) => {
    const current = idsRef.current;
    if (wished) return current.includes(productId) ? current : [...current, productId];
    return current.filter((id) => id !== productId);
  };

  const toggle = useCallback(async (productId) => {
    const wasWished = idsRef.current.includes(productId);
    setIds(apply(productId, !wasWished)); // optimistic update

    try {
      await api.put("/wishlist/" + productId, { wished: !wasWished });
      setError(null);
    } catch (err) {
      console.error("Wishlist sync failed", err);
      // FIX 2 (unhandled failure): the original only logged. Undo just THIS product's change on
      // top of the latest list (other pending taps stay) and tell the shopper.
      setIds(apply(productId, wasWished));
      setError("Could not update your wishlist. Please try again.");
    }
  }, []);

  const isWished = (productId) => ids.includes(productId);
  const wishedProducts = ids.map((id) => products.find((p) => p._id === id)).filter(Boolean);

  return { ids, count: ids.length, isWished, toggle, wishedProducts, error };
}
