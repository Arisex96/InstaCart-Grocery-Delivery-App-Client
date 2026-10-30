// src/hooks/useSavedLists.js — state for the "Saved lists" page.
//
// Shape:  lists = [{ id, name, items: [{ product, quantity }] }]
// `initialLists` comes from the server cache (shared, treat it as read-only).
//
// API:
//   setQuantity(listId, productId, quantity)   quantity <= 0 removes the item; clamp to product.stock
//   removeItem(listId, productId)
//   moveItem(fromListId, toListId, productId)  merges quantities when the target already has the product
//   renameList(listId, name)                   trims; ignores empty names
//   listTotal(listId)                          sum of price * quantity
import { useCallback, useState } from "react";

const sum = (items) => items.reduce((total, it) => total + it.product.price * it.quantity, 0);

// Returns a new `lists` array where only list `listId` is replaced; every other list keeps its identity.
const updateList = (lists, listId, update) => lists.map((l) => (l.id === listId ? update(l) : l));

export default function useSavedLists(initialLists) {
  // FIX: `lists` is the only source of truth. The old hook also stored `totals` in a second
  // state that every action had to patch by hand (moveItem forgot the target list).
  const [lists, setLists] = useState(initialLists);

  // ROOT CAUSE: the old code copied only the outer array (`[...lists]`) and then assigned to
  // `item.quantity` / `list.items` on the shared nested objects. Lists and items kept their
  // identity, so the memoised list card saw "same props" and never re-rendered, and frozen
  // server data threw.
  // FIX: copy every level on the path to the change (list, then items, then the item); return
  // untouched lists and items as they are (structural sharing).
  const setQuantity = useCallback((listId, productId, quantity) => {
    setLists((prev) =>
      updateList(prev, listId, (list) => ({
        ...list,
        items:
          quantity <= 0
            ? list.items.filter((it) => it.product._id !== productId)
            : list.items.map((it) =>
                it.product._id === productId ? { ...it, quantity: Math.min(quantity, it.product.stock) } : it,
              ),
      })),
    );
  }, []);

  const removeItem = useCallback((listId, productId) => setQuantity(listId, productId, 0), [setQuantity]);

  const moveItem = useCallback((fromListId, toListId, productId) => {
    if (fromListId === toListId) return;
    setLists((prev) => {
      const from = prev.find((l) => l.id === fromListId);
      const to = prev.find((l) => l.id === toListId);
      const item = from?.items.find((it) => it.product._id === productId);
      if (!from || !to || !item) return prev;

      return prev.map((list) => {
        if (list.id === fromListId) return { ...list, items: list.items.filter((it) => it !== item) };
        if (list.id !== toListId) return list;
        const existing = list.items.find((it) => it.product._id === productId);
        return existing
          ? {
              ...list,
              items: list.items.map((it) =>
                it === existing ? { ...it, quantity: Math.min(it.quantity + item.quantity, item.product.stock) } : it,
              ),
            }
          : { ...list, items: [...list.items, item] };
      });
    });
  }, []);

  const renameList = useCallback((listId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLists((prev) => updateList(prev, listId, (list) => ({ ...list, name: trimmed })));
  }, []);

  // FIX: derived on demand from the current items, so it can never drift.
  const listTotal = (listId) => sum(lists.find((l) => l.id === listId)?.items ?? []);

  return { lists, setQuantity, removeItem, moveItem, renameList, listTotal };
}
