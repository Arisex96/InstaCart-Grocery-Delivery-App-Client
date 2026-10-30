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
import { useState } from "react";

const sum = (items) => items.reduce((total, it) => total + it.product.price * it.quantity, 0);

export default function useSavedLists(initialLists) {
  const [lists, setLists] = useState(initialLists);
  const [totals, setTotals] = useState(() => Object.fromEntries(initialLists.map((l) => [l.id, sum(l.items)])));

  const setQuantity = (listId, productId, quantity) => {
    const next = [...lists];
    const list = next.find((l) => l.id === listId);
    if (!list) return;
    const item = list.items.find((it) => it.product._id === productId);
    if (!item) return;

    if (quantity <= 0) {
      list.items = list.items.filter((it) => it !== item);
    } else {
      item.quantity = Math.min(quantity, item.product.stock);
    }
    setLists(next);
    setTotals({ ...totals, [listId]: sum(list.items) });
  };

  const removeItem = (listId, productId) => setQuantity(listId, productId, 0);

  const moveItem = (fromListId, toListId, productId) => {
    if (fromListId === toListId) return;
    const next = [...lists];
    const from = next.find((l) => l.id === fromListId);
    const to = next.find((l) => l.id === toListId);
    const item = from?.items.find((it) => it.product._id === productId);
    if (!from || !to || !item) return;

    from.items = from.items.filter((it) => it !== item);
    const existing = to.items.find((it) => it.product._id === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, item.product.stock);
    } else {
      to.items.push(item);
    }
    setLists(next);
    setTotals({ ...totals, [fromListId]: sum(from.items) });
  };

  const renameList = (listId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLists(lists.map((l) => (l.id === listId ? { ...l, name: trimmed } : l)));
  };

  const listTotal = (listId) => totals[listId] ?? 0;

  return { lists, setQuantity, removeItem, moveItem, renameList, listTotal };
}
