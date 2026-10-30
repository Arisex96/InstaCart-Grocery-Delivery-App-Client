// src/components/SavedLists.jsx — read-only. The list cards are memoised: a card only re-renders
// when its `list` object is a different object than before (a common optimisation for long lists).
import { memo } from "react";
import useSavedLists from "../hooks/useSavedLists";

const ListCard = memo(
  function ListCard({ list, total, otherListId, onQuantity, onMove }) {
    return (
      <section className="w-72 rounded-2xl border border-app-border bg-white p-3 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-app-green">{list.name}</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {list.items.map(({ product, quantity }) => (
            <li key={product._id} className="rounded-lg bg-app-cream p-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{product.name}</span>
                <span className="flex items-center gap-1">
                  <button aria-label={"Decrease " + product.name} onClick={() => onQuantity(list.id, product._id, quantity - 1)} className="rounded-full bg-gray-200 px-2">
                    -
                  </button>
                  <span aria-label={product.name + " quantity in " + list.name}>{quantity}</span>
                  <button aria-label={"Increase " + product.name} onClick={() => onQuantity(list.id, product._id, quantity + 1)} className="rounded-full bg-gray-200 px-2">
                    +
                  </button>
                </span>
              </div>
              <button
                onClick={() => onMove(list.id, otherListId, product._id)}
                className="mt-1 text-xs font-semibold text-app-orange hover:underline"
              >
                Move to {otherListId}
              </button>
            </li>
          ))}
          {list.items.length === 0 && <li className="text-xs text-app-text-light">Empty list</li>}
        </ul>
        <p className="mt-2 text-right text-sm font-semibold">
          Total: <span data-testid={"total-" + list.id}>${total.toFixed(2)}</span>
        </p>
      </section>
    );
  },
  // Re-render only when this list's data changed.
  (prev, next) => prev.list === next.list && prev.total === next.total,
);

export default function SavedLists({ initialLists }) {
  const { lists, setQuantity, moveItem, listTotal } = useSavedLists(initialLists);
  return (
    <div className="flex flex-wrap gap-4">
      {lists.map((list) => (
        <ListCard
          key={list.id}
          list={list}
          total={listTotal(list.id)}
          otherListId={lists.find((l) => l.id !== list.id)?.id}
          onQuantity={setQuantity}
          onMove={moveItem}
        />
      ))}
    </div>
  );
}
